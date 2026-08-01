// AI-ready contracts for future @ecf/ai integration — zero implementation, pure interfaces

export class IImageAnalyzer {
  analyze(buffer) { throw new Error("AI contract interface method."); }
}

export class IBackgroundRemover {
  remove(buffer, options) { throw new Error("AI contract interface method."); }
}

export class ICaptionGenerator {
  generate(buffer, options) { throw new Error("AI contract interface method."); }
}

export class IFaceDetector {
  detect(buffer, options) { throw new Error("AI contract interface method."); }
}

export class IObjectDetector {
  detect(buffer, options) { throw new Error("AI contract interface method."); }
}

export class IContentModerator {
  moderate(buffer, options) { throw new Error("AI contract interface method."); }
}

export class ISmartCropper {
  crop(buffer, options) { throw new Error("AI contract interface method."); }
}
