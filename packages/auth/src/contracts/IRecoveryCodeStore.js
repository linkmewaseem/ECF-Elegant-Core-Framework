export class IRecoveryCodeStore {
  generateCodes(userId, count = 8) { throw new Error("Method not implemented."); }
  verifyAndConsume(userId, code) { throw new Error("Method not implemented."); }
}
export default IRecoveryCodeStore;
