export class MagicByteSniffer {
  /**
   * Sniff magic byte signature from buffer header.
   */
  static sniff(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
      return "application/octet-stream";
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "image/png";
    }

    // GIF: GIF87a or GIF89a
    const headerStr = buffer.subarray(0, 6).toString("ascii");
    if (headerStr === "GIF87a" || headerStr === "GIF89a") {
      return "image/gif";
    }

    // WEBP: "RIFF" at 0, "WEBP" at 8
    if (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return "image/webp";
    }

    // PDF: %PDF
    if (buffer.subarray(0, 4).toString("ascii") === "%PDF") {
      return "application/pdf";
    }

    // ZIP: PK\x03\x04
    if (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      return "application/zip";
    }

    // MP4: ftyp at offset 4
    if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
      return "video/mp4";
    }

    return "application/octet-stream";
  }
}

export default MagicByteSniffer;
