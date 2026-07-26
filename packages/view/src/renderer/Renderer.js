import ViewError from "../errors/ViewError.js";

export default class Renderer {
    render(compiledTemplate, data, context = null) {
        return this.renderToString(compiledTemplate, data, context);
    }

    renderToString(compiledTemplate, data = {}, context = null) {
        this.validateCompiledTemplate(compiledTemplate);
        return compiledTemplate.render(data, context);
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
