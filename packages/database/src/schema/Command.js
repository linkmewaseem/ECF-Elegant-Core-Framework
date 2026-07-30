export class SchemaOperation {
    constructor(name, parameters = {}) {
        this.name = name;
        this.type = name;
        this.parameters = parameters;
    }

    accept(visitor) {
        if (!visitor) return null;
        if (typeof visitor.visit === "function") {
            return visitor.visit(this);
        }
        const handlerName = `visit${this.type.charAt(0).toUpperCase()}${this.type.slice(1)}`;
        if (typeof visitor[handlerName] === "function") {
            return visitor[handlerName](this);
        }
        return null;
    }
}

export class Command extends SchemaOperation {}

export class CreateTableCommand extends Command {
    constructor(parameters = {}) {
        super("createTable", parameters);
    }
}

export class AddColumnCommand extends Command {
    constructor(column) {
        super("addColumn", { column });
        this.column = column;
    }
}

export class DropColumnCommand extends Command {
    constructor(columns) {
        const cols = Array.isArray(columns) ? columns : [columns];
        super("dropColumn", { columns: cols });
        this.columns = cols;
    }
}

export class RenameColumnCommand extends Command {
    constructor(from, to) {
        super("renameColumn", { from, to });
        this.from = from;
        this.to = to;
    }
}

export class AddIndexCommand extends Command {
    constructor(indexType, columns, indexName = null) {
        const cols = Array.isArray(columns) ? columns : [columns];
        super("addIndex", { indexType, columns: cols, indexName });
        this.indexType = indexType; // 'index', 'unique', 'primary', 'fulltext', 'spatial'
        this.columns = cols;
        this.indexName = indexName;
    }
}

export class DropIndexCommand extends Command {
    constructor(indexType, indexName) {
        super("dropIndex", { indexType, indexName });
        this.indexType = indexType;
        this.indexName = indexName;
    }
}

export class AddForeignKeyCommand extends Command {
    constructor(columns, foreignKeyName = null) {
        const cols = Array.isArray(columns) ? columns : [columns];
        super("addForeignKey", { columns: cols, foreignKeyName });
        this.columns = cols;
        this.foreignKeyName = foreignKeyName;
        this.referencesColumns = [];
        this.onTable = null;
        this.onDeleteAction = null;
        this.onUpdateAction = null;
    }

    references(columns) {
        this.referencesColumns = Array.isArray(columns) ? columns : [columns];
        return this;
    }

    on(table) {
        this.onTable = table;
        return this;
    }

    onDelete(action) {
        this.onDeleteAction = action;
        return this;
    }

    onUpdate(action) {
        this.onUpdateAction = action;
        return this;
    }
}

export class DropForeignKeyCommand extends Command {
    constructor(foreignKeyName) {
        super("dropForeignKey", { foreignKeyName });
        this.foreignKeyName = foreignKeyName;
    }
}

export default Command;
