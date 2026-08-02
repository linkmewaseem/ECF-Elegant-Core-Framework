/**
 * Cost ($), Token & Latency Telemetry Calculator.
 */
export class TokenTracker {
  static calculateCost(promptTokens, completionTokens, model = 'gpt-4o') {
    const promptRatePer1k = 0.005;
    const completionRatePer1k = 0.015;
    const cost = ((promptTokens / 1000) * promptRatePer1k) + ((completionTokens / 1000) * completionRatePer1k);
    return Number(cost.toFixed(6));
  }
}

export default TokenTracker;
