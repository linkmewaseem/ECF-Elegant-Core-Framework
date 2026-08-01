export class IMetadataProvider {
  metadata(path) { throw new Error("Method not implemented."); }
  mimeType(path) { throw new Error("Method not implemented."); }
  size(path) { throw new Error("Method not implemented."); }
  lastModified(path) { throw new Error("Method not implemented."); }
}
export default IMetadataProvider;
