export default class EventContext {
    constructor({ event, model, changes = {}, original = {}, connection = null, inTransaction = false }) {
        this.event = event;
        this.model = model;
        this.changes = changes;
        this.original = original;
        this.connection = connection;
        this.inTransaction = Boolean(inTransaction);
        this.timestamp = new Date().toISOString();
    }
}
