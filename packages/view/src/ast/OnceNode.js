export default class OnceNode {
    constructor(children = [], id = null) {
        this.type = "Once";
        this.id = id;
        this.children = Array.isArray(children) ? children : [];
    }
}
