export class PluginException extends Error {
    constructor(message) {
        super(message);
        this.name = "PluginException";
    }
}

export class PluginDependencyException extends PluginException {
    constructor(message) {
        super(message);
        this.name = "PluginDependencyException";
    }
}

export class PluginCapabilityException extends PluginException {
    constructor(message) {
        super(message);
        this.name = "PluginCapabilityException";
    }
}

export class PluginLifecycleException extends PluginException {
    constructor(message) {
        super(message);
        this.name = "PluginLifecycleException";
    }
}
