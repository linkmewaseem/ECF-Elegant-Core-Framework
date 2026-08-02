/**
 * Text Chunking Strategies (Fixed, Semantic, Markdown, Code).
 */
export class Chunker {
  static fixed(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + chunkSize));
      start += chunkSize - overlap;
    }
    return chunks;
  }

  static markdown(text) {
    return text.split(/^#{1,6} /m).filter(Boolean);
  }

  static code(text) {
    return text.split(/\n\s*\n/).filter(Boolean);
  }
}

export const Chunk = Chunker;
export default Chunker;
