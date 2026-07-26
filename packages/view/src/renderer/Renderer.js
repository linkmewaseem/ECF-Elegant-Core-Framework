import ViewError from "../errors/ViewError.js";

export default class Renderer {
    render(compiledTemplate, data) {
        return this.renderToString(compiledTemplate, data);
    }

    renderToString(compiledTemplate, data = {}) {
        this.validateCompiledTemplate(compiledTemplate);
        return compiledTemplate.render(data);
    }

    renderToStream() {
        throw new ViewError("renderToStream() is not implemented.");
    }

    renderStatic() {
        throw new ViewError("renderStatic() is not implemented.");
    }

    validateCompiledTemplate(compiledTemplate) {
        if (!compiledTemplate || typeof compiledTemplate.render !== "function") {
            throw new ViewError("Renderer requires a CompiledTemplate object with a render() method.");
        }
    }
}
