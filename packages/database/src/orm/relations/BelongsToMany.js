import Relation from "./Relation.js";
import NamingStrategy from "../../schema/NamingStrategy.js";
import ModelCollection from "../ModelCollection.js";

export default class BelongsToMany extends Relation {
    pivotTable;
    foreignPivotKey;
    relatedPivotKey;
    parentKey;
    relatedKey;
    relatedTable;

    constructor(
        parent,
        related,
        table = null,
        foreignPivotKey = null,
        relatedPivotKey = null,
        parentKey = null,
        relatedKey = null
    ) {
        super(parent, related);

        this.parentKey = parentKey || parent.constructor.primaryKey || "id";
        this.relatedKey = relatedKey || related.primaryKey || "id";
        this.pivotTable = table || NamingStrategy.pivotTableName(parent.constructor.name, related.name);
        this.foreignPivotKey = foreignPivotKey || NamingStrategy.foreignKey(parent.constructor.name, this.parentKey);
        this.relatedPivotKey = relatedPivotKey || NamingStrategy.foreignKey(related.name, this.relatedKey);

        const repo = related.repository();
        this.relatedTable = repo.getTable();

        this.meta = {
            type: "belongsToMany",
            parentModel: parent.constructor,
            relatedModel: related,
            foreignKey: this.foreignPivotKey,
            localKey: this.parentKey,
            pivotTable: this.pivotTable,
            foreignPivotKey: this.foreignPivotKey,
            relatedPivotKey: this.relatedPivotKey,
            inverse: false
        };

        const parentVal = this.parent.getAttribute(this.parentKey);
        this.builder = this.builder
            .join(this.pivotTable, `${this.relatedTable}.${this.relatedKey}`, "=", `${this.pivotTable}.${this.relatedPivotKey}`)
            .where(`${this.pivotTable}.${this.foreignPivotKey}`, parentVal)
            .select(`${this.relatedTable}.*`);
    }

    async getResults() {
        const parentVal = this.parent.getAttribute(this.parentKey);
        if (parentVal === null || parentVal === undefined) {
            return new ModelCollection();
        }
        return this.get();
    }
}
