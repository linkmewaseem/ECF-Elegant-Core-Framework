/**
 * AI Safety & Content Moderation Engine.
 */
export class AiSafety {
  static moderate(text) {
    const flagged = text.toLowerCase().includes('exploit') || text.toLowerCase().includes('malware');
    return {
      flagged,
      categories: { hate: false, violence: false, malware: flagged },
    };
  }

  static redactPii(text) {
    return text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
               .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');
  }
}

export default AiSafety;
