export class Content {
  constructor(data = {}) {
    this.view = data.view || null;
    this.html = data.html || null;
    this.text = data.text || null;
    this.markdown = data.markdown || null;
    this.data = data.data || {};
  }
}

export default Content;
