export class ChannelHooks {
  constructor() {
    this.hooks = {
      beforePublish: [],
      afterPublish: [],
      onFailure: [],
      onRetry: [],
      onAuthorize: [],
    };
  }

  on(hookName, callback) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].push(callback);
    }
    return this;
  }

  async trigger(hookName, ...args) {
    if (!this.hooks[hookName]) return;
    for (const callback of this.hooks[hookName]) {
      await callback(...args);
    }
  }
}

export default ChannelHooks;
