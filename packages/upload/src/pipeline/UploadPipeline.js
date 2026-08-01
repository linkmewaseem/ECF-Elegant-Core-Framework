export class UploadPipeline {
  constructor(steps = []) {
    this.steps = steps;
  }

  addStep(step) {
    this.steps.push(step);
    return this;
  }

  async process(uploadedFile) {
    let index = 0;

    const next = async (file) => {
      if (index >= this.steps.length) {
        return file;
      }
      const currentStep = this.steps[index++];
      return currentStep.handle(file, next);
    };

    return next(uploadedFile);
  }
}

export default UploadPipeline;
