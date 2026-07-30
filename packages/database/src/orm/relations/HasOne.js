import Relation from "./Relation.js";
import NamingStrategy from "../../schema/NamingStrategy.js";

export default class HasOne extends Relation {
    foreignKey;
    localKey;

    constructor(parent, related, foreignKey = null, localKey = null) {
        super(parent, related);

        this.localKey = localKey || parent.constructor.primaryKey || "id";
        this.foreignKey = foreignKey || NamingStrategy.foreignKey(parent.constructor.name, this.localKey);

        this.meta = {
            type: "hasOne",
            parentModel: parent.constructor,
            relatedModel: related,
            foreignKey: this.foreignKey,
            localKey: this.localKey,
            pivotTable: null,
            foreignPivotKey: null,
            relatedPivotKey: null,
            inverse: false
        };

        const parentVal = this.parent.getAttribute(this.localKey);
        this.builder = this.builder.where(this.foreignKey, parentVal);
    }

    async getResults() {
        const parentVal = this.parent.getAttribute(this.localKey);
        if (parentVal === null || parentVal === undefined) {
            return null;
        }
        return this.first();
    }
}
