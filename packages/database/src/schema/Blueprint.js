import ColumnDefinition from "./ColumnDefinition.js";
import ForeignIdColumnDefinition from "./ForeignIdColumnDefinition.js";
import NamingStrategy from "./NamingStrategy.js";
import {
    CreateTableCommand,
    AddColumnCommand,
    DropColumnCommand,
    RenameColumnCommand,
    AddIndexCommand,
    DropIndexCommand,
    AddForeignKeyCommand,
    DropForeignKeyCommand
} from "./Command.js";

export default class Blueprint {
    constructor(table, callback = null) {
        this.table = table;
        this.creating = false;
        this.connectionName = null;
        this.namingStrategy = new NamingStrategy();
        this.columns = [];
        this.commands = [];

        if (typeof callback === "function") {
            callback(this);
        }
    }

    setConnection(name) {
        this.connectionName = name;
        return this;
    }

    connection(name) {
        return this.setConnection(name);
    }

    setNamingStrategy(strategy) {
        if (strategy && typeof strategy.createIndexName === "function") {
            this.namingStrategy = strategy;
        }
        return this;
    }

    create() {
        this.creating = true;
        this.commands.unshift(new CreateTableCommand({ table: this.table }));
        return this;
    }

    /**
     * Generic column creation factory method.
     */
    addColumn(type, name, parameters = {}) {
        const column = new ColumnDefinition(type, name, parameters);
        this.columns.push(column);

        if (!this.creating) {
            this.commands.push(new AddColumnCommand(column));
        }

        return column;
    }

    // Common Column Types

    id(name = "id") {
        return this.bigIncrements(name);
    }

    increments(name = "id") {
        return this.addColumn("integer", name, { autoIncrement: true })
            .autoIncrement()
            .primary()
            .unsigned();
    }

    bigIncrements(name = "id") {
        return this.addColumn("bigInteger", name, { autoIncrement: true })
            .autoIncrement()
            .primary()
            .unsigned();
    }

    string(name, length = 255) {
        return this.addColumn("string", name, { length });
    }

    text(name) {
        return this.addColumn("text", name);
    }

    integer(name) {
        return this.addColumn("integer", name);
    }

    bigInteger(name) {
        return this.addColumn("bigInteger", name);
    }

    float(name, precision = 8, scale = 2) {
        return this.addColumn("float", name, { precision, scale });
    }

    double(name, precision = 8, scale = 2) {
        return this.addColumn("double", name, { precision, scale });
    }

    decimal(name, precision = 8, scale = 2) {
        return this.addColumn("decimal", name, { precision, scale });
    }

    boolean(name) {
        return this.addColumn("boolean", name);
    }

    date(name) {
        return this.addColumn("date", name);
    }

    datetime(name, precision = 0) {
        return this.addColumn("datetime", name, { precision });
    }

    timestamp(name, precision = 0) {
        return this.addColumn("timestamp", name, { precision });
    }

    json(name) {
        return this.addColumn("json", name);
    }

    uuid(name = "uuid") {
        return this.addColumn("uuid", name);
    }

    binary(name) {
        return this.addColumn("binary", name);
    }

    foreignId(name) {
        const column = new ForeignIdColumnDefinition(this, "bigInteger", name);
        this.columns.push(column);
        if (!this.creating) {
            this.commands.push(new AddColumnCommand(column));
        }
        return column;
    }

    // Helper Methods

    timestamps(precision = 0) {
        this.timestamp("created_at", precision).nullable();
        this.timestamp("updated_at", precision).nullable();
    }

    softDeletes(column = "deleted_at", precision = 0) {
        this.timestamp(column, precision).nullable();
    }

    rememberToken() {
        this.string("remember_token", 100).nullable();
    }

    // Alter & Index Commands

    dropColumn(...columns) {
        const flatColumns = columns.flat();
        const cmd = new DropColumnCommand(flatColumns);
        this.commands.push(cmd);
        return cmd;
    }

    renameColumn(from, to) {
        const cmd = new RenameColumnCommand(from, to);
        this.commands.push(cmd);
        return cmd;
    }

    index(columns, name = null) {
        const indexName = name || this.createIndexName("index", columns);
        const cmd = new AddIndexCommand("index", columns, indexName);
        this.commands.push(cmd);
        return cmd;
    }

    unique(columns, name = null) {
        const indexName = name || this.createIndexName("unique", columns);
        const cmd = new AddIndexCommand("unique", columns, indexName);
        this.commands.push(cmd);
        return cmd;
    }

    primary(columns, name = null) {
        const indexName = name || this.createIndexName("primary", columns);
        const cmd = new AddIndexCommand("primary", columns, indexName);
        this.commands.push(cmd);
        return cmd;
    }

    dropIndex(indexName) {
        const cmd = new DropIndexCommand("index", indexName);
        this.commands.push(cmd);
        return cmd;
    }

    dropUnique(indexName) {
        const cmd = new DropIndexCommand("unique", indexName);
        this.commands.push(cmd);
        return cmd;
    }

    dropPrimary(indexName = null) {
        const cmd = new DropIndexCommand("primary", indexName);
        this.commands.push(cmd);
        return cmd;
    }

    foreign(columns, name = null) {
        const foreignKeyName = name || this.createIndexName("foreign", columns);
        const cmd = new AddForeignKeyCommand(columns, foreignKeyName);
        this.commands.push(cmd);
        return cmd;
    }

    dropForeign(foreignKeyName) {
        const cmd = new DropForeignKeyCommand(foreignKeyName);
        this.commands.push(cmd);
        return cmd;
    }

    // Validation & Utilities

    validate() {
        if (!this.table || typeof this.table !== "string" || !this.table.trim()) {
            throw new Error(`[Blueprint Validation Error] Table name must be a non-empty string.`);
        }

        for (const col of this.columns) {
            if (!col.name || typeof col.name !== "string" || !col.name.trim()) {
                throw new Error(`[Blueprint Validation Error] Column name cannot be empty on table '${this.table}'.`);
            }
            if (!col.type || typeof col.type !== "string" || !col.type.trim()) {
                throw new Error(`[Blueprint Validation Error] Column '${col.name}' must have a valid data type on table '${this.table}'.`);
            }
        }

        for (const cmd of this.commands) {
            if (cmd.type === "renameColumn") {
                if (!cmd.from || !cmd.to || typeof cmd.from !== "string" || typeof cmd.to !== "string") {
                    throw new Error(`[Blueprint Validation Error] renameColumn requires non-empty 'from' and 'to' column names on table '${this.table}'.`);
                }
            }
            if (cmd.type === "dropColumn") {
                if (!Array.isArray(cmd.columns) || cmd.columns.length === 0) {
                    throw new Error(`[Blueprint Validation Error] dropColumn requires at least one target column on table '${this.table}'.`);
                }
            }
        }

        return true;
    }

    clone() {
        const copy = new Blueprint(this.table);
        copy.creating = this.creating;
        copy.connectionName = this.connectionName;
        copy.namingStrategy = this.namingStrategy;

        for (const col of this.columns) {
            const colCopy = new ColumnDefinition(col.type, col.name, { ...col.parameters });
            colCopy.attributes = { ...col.attributes };
            colCopy.options = { ...col.options };
            copy.columns.push(colCopy);
        }

        for (const cmd of this.commands) {
            copy.commands.push(cmd);
        }

        return copy;
    }

    createIndexName(type, columns) {
        return this.namingStrategy.createIndexName(this.table, type, columns);
    }

    toSql(grammar) {
        return grammar.compile(this);
    }
}
