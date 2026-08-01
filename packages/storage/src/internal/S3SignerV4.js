import crypto from "node:crypto";

export class S3SignerV4 {
  constructor(options = {}) {
    this.accessKeyId = options.accessKeyId || "";
    this.secretAccessKey = options.secretAccessKey || "";
    this.region = options.region || "us-east-1";
    this.service = options.service || "s3";
    this.endpoint = options.endpoint || `https://s3.${this.region}.amazonaws.com`;
    this.bucket = options.bucket || "";
  }

  getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.createHmac("sha256", "AWS4" + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    return kSigning;
  }

  signHeaders(method, requestUrl, headers = {}, payloadHash = "UNSIGNED-PAYLOAD") {
    const urlObj = new URL(requestUrl);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    const host = urlObj.host;
    const reqHeaders = {
      host,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      ...headers
    };

    const sortedHeaderKeys = Object.keys(reqHeaders).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const canonicalHeaders = sortedHeaderKeys.map(k => `${k.toLowerCase()}:${String(reqHeaders[k]).trim()}\n`).join("");
    const signedHeaders = sortedHeaderKeys.map(k => k.toLowerCase()).join(";");

    const canonicalQueryString = Array.from(urlObj.searchParams.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const canonicalRequest = [
      method.toUpperCase(),
      urlObj.pathname,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex")
    ].join("\n");

    const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, this.service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...reqHeaders,
      Authorization: authorizationHeader
    };
  }

  presignUrl(method, requestUrl, expiresSeconds = 3600) {
    const urlObj = new URL(requestUrl);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;

    urlObj.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
    urlObj.searchParams.set("X-Amz-Credential", `${this.accessKeyId}/${credentialScope}`);
    urlObj.searchParams.set("X-Amz-Date", amzDate);
    urlObj.searchParams.set("X-Amz-Expires", String(expiresSeconds));
    urlObj.searchParams.set("X-Amz-SignedHeaders", "host");

    const canonicalQueryString = Array.from(urlObj.searchParams.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const canonicalHeaders = `host:${urlObj.host}\n`;
    const signedHeaders = "host";

    const canonicalRequest = [
      method.toUpperCase(),
      urlObj.pathname,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      "UNSIGNED-PAYLOAD"
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex")
    ].join("\n");

    const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, this.service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    urlObj.searchParams.set("X-Amz-Signature", signature);
    return urlObj.toString();
  }
}

export default S3SignerV4;
