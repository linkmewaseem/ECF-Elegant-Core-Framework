/**
 * Content Negotiation utility for Accept header parsing and format matching.
 */
export class ContentNegotiation {
  /**
   * @param {import('../contracts/IRequest.js').IRequest} request
   */
  constructor(request) {
    this.request = request;
  }

  wantsJson() {
    const accept = this.request.header('accept', '');
    return accept.includes('application/json') || accept.includes('*/*');
  }

  acceptsHtml() {
    const accept = this.request.header('accept', '');
    return accept.includes('text/html') || accept.includes('*/*');
  }

  acceptsXml() {
    const accept = this.request.header('accept', '');
    return accept.includes('text/xml') || accept.includes('application/xml');
  }

  negotiate(availableTypes = ['json', 'html']) {
    if (this.wantsJson() && availableTypes.includes('json')) return 'json';
    if (this.acceptsHtml() && availableTypes.includes('html')) return 'html';
    if (this.acceptsXml() && availableTypes.includes('xml')) return 'xml';
    return availableTypes[0] || 'json';
  }
}
