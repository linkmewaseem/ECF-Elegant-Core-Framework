export class IVersionProvider {
  versions(path) { throw new Error("Method not implemented."); }
  restoreVersion(path, versionId) { throw new Error("Method not implemented."); }
  deleteVersion(path, versionId) { throw new Error("Method not implemented."); }
}
export default IVersionProvider;
