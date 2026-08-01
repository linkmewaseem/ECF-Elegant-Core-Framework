export class IKeyProvider {
  getKey(keyId = "default") { throw new Error("Method not implemented."); }
  getSigningKey(keyId = null) { throw new Error("Method not implemented."); }
  getVerificationKey(keyId = null) { throw new Error("Method not implemented."); }
}
export default IKeyProvider;
