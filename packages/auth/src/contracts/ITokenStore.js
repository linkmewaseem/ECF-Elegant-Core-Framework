export class ITokenStore {
  isRevoked(tokenId) { throw new Error("Method not implemented."); }
  revoke(tokenId, expiresAt = null) { throw new Error("Method not implemented."); }
}
export default ITokenStore;
