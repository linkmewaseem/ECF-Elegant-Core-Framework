export class ICapabilityProvider {
  supports(capability) { return false; }
  capabilities() { return []; }
}
export default ICapabilityProvider;
