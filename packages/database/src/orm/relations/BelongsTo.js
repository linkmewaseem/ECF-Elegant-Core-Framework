import Relation from "./Relation.js";
import NamingStrategy from "../../schema/NamingStrategy.js";

export default class BelongsTo extends Relation {
    foreignKey;
    ownerKey;

    constructor(parent, related, foreignKey = null, ownerKey = null) {
        super(parent, related);

        this.ownerKey = ownerKey || related.primaryKey || "id";
        this.foreignKey = foreignKey || NamingStrategy.foreignKey(related.name, this.ownerKey);

        this.meta = {
            type: "belongsTo",
            parentModel: parent.constructor,
            relatedModel: related,
            foreignKey: this.foreignKey,
            localKey: this.ownerKey,
            pivotTable: null,
            foreignPivotKey: null,
            relatedPivotKey: null,
            inverse: true
        };

        const foreignVal = this.parent.getAttribute(this.foreignKey);
        this.builder = this.builder.where(this.ownerKey, foreignVal);
    }

    async getResults() {
        const foreignVal = this.parent.getAttribute(this.foreignKey);
        if (foreignVal === null || foreignVal === undefined) {
            return null;
        }
        return this.first();
    }
}
