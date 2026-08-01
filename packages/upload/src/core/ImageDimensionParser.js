export class ImageDimensionParser {
  /**
   * Parse image dimensions (width, height) from buffer header.
   */
  static parse(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 10) {
      return { width: 0, height: 0, valid: false };
    }

    // 1. PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      if (buffer.length >= 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height, valid: true };
      }
    }

    // 2. GIF
    const headerStr = buffer.subarray(0, 6).toString("ascii");
    if (headerStr === "GIF87a" || headerStr === "GIF89a") {
      if (buffer.length >= 10) {
        const width = buffer.readUInt16LE(6);
        const height = buffer.readUInt16LE(8);
        return { width, height, valid: true };
      }
    }

    // 3. JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, valid: true };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    // 4. WEBP
    if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
      const format = buffer.subarray(12, 16).toString("ascii");
      if (format === "VP8 " && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height, valid: true };
      } else if (format === "VP8L" && buffer.length >= 25) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height, valid: true };
      }
    }

    return { width: 0, height: 0, valid: false };
  }
}

export default ImageDimensionParser;
