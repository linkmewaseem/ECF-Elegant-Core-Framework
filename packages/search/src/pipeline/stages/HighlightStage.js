export class HighlightStage {
  static apply(hits, queryTerm, highlightFields = []) {
    if (!hits || !queryTerm || highlightFields.length === 0) return hits;

    const regex = new RegExp(`(${queryTerm})`, "gi");

    return hits.map((hit) => {
      const _formatted = { ...hit };
      for (const field of highlightFields) {
        if (hit[field] && typeof hit[field] === "string") {
          _formatted[field] = hit[field].replace(regex, "<mark>$1</mark>");
        }
      }
      return { ...hit, _formatted };
    });
  }
}

export default HighlightStage;
