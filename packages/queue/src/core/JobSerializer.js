import crypto from "node:crypto";
import { InvalidJobPayloadException } from "../exceptions/QueueException.js";

export class JobSerializer {
  constructor(secretKey = "ecf-queue-payload-secret") {
    this.secretKey = secretKey;
  }

  serialize(jobInstance, options = {}) {
    const id = options.id || `job_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const jobName = jobInstance.constructor ? jobInstance.constructor.name : "AnonymousJob";
    const data = jobInstance.data || jobInstance;
    const queue = options.queue || jobInstance.queue || "default";
    const delay = options.delay || jobInstance.delay || 0;
    const attempts = options.attempts || 0;
    const maxTries = options.tries || jobInstance.tries || 3;
    const tags = typeof jobInstance.tags === "function" ? jobInstance.tags() : (jobInstance.tags || []);

    const rawPayload = JSON.stringify({
      v: 1,
      id,
      job: jobName,
      data,
      queue,
      delay,
      attempts,
      maxTries,
      tags
    });

    const checksum = crypto.createHash("sha256").update(rawPayload).digest("hex");
    const signature = crypto.createHmac("sha256", this.secretKey).update(checksum).digest("hex");

    return {
      v: 1,
      id,
      job: jobName,
      data,
      queue,
      delay,
      attempts,
      maxTries,
      tags,
      checksum,
      signature
    };
  }

  deserialize(payload) {
    if (!payload || typeof payload !== "object" || !payload.checksum || !payload.signature) {
      throw new InvalidJobPayloadException("Missing payload structure, checksum, or signature.");
    }

    const rawPayload = JSON.stringify({
      v: payload.v || 1,
      id: payload.id,
      job: payload.job,
      data: payload.data,
      queue: payload.queue,
      delay: payload.delay,
      attempts: payload.attempts,
      maxTries: payload.maxTries,
      tags: payload.tags
    });

    const expectedChecksum = crypto.createHash("sha256").update(rawPayload).digest("hex");
    if (expectedChecksum !== payload.checksum) {
      throw new InvalidJobPayloadException("Payload SHA-256 checksum mismatch.");
    }

    const expectedSignature = crypto.createHmac("sha256", this.secretKey).update(expectedChecksum).digest("hex");
    if (expectedSignature !== payload.signature) {
      throw new InvalidJobPayloadException("Payload HMAC signature verification failed (tampered payload).");
    }

    return payload;
  }
}

export default JobSerializer;
