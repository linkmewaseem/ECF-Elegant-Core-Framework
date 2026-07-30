import CompiledStatement from "../CompiledStatement.js";

export default class SchemaGrammar {
    constructor() {
        this.supports = {
            alter: true,
            after: false,
            first: false,
            renameColumn: true,
            dropColumn: true,
            foreignKeys: true,
            json: true
        };
    }

    wrap(value) {
        if (typeof value !== "string") return "";
        if (value.includes(".")) {
            return value.split(".").map(part => this.wrap(part)).join(".");
        }
        return `"${value.replace(/"/g, '""')}"`;
    }

    wrapArray(values = []) {
        return values.map(v => this.wrap(v));
    }

    compile(blueprint) {
        blueprint.validate();

        if (blueprint.creating) {
            return this.compileCreate(blueprint);
        }
        return this.compileTable(blueprint);
    }

    compileCreate(blueprint) {
        const columns = blueprint.columns.map(col => this.compileColumn(col)).filter(Boolean);

        // Extract inline commands (foreign keys) when creating table
        const inlineCommands = blueprint.commands.filter(cmd => cmd.name === "addForeignKey");
        const inlineSqls = inlineCommands.flatMap(cmd => this.compileAddForeignKey(blueprint, cmd));

        const body = [...columns, ...inlineSqls].join(", ");

        const sqls = [CompiledStatement.make(`CREATE TABLE ${this.wrap(blueprint.table)} (${body})`)];

        // Out-of-line commands (indexes, drop columns, etc.)
        const outOfLineCommands = blueprint.commands.filter(cmd => cmd.name !== "createTable" && cmd.name !== "addForeignKey");
        const additional = this.compileCommands(blueprint, outOfLineCommands);

        return [...sqls, ...additional];
    }

    compileTable(blueprint) {
        return this.compileCommands(blueprint, blueprint.commands);
    }

    compileCommands(blueprint, commands = []) {
        const statements = [];

        for (const command of commands) {
            switch (command.name) {
                case "addColumn":
                    statements.push(...this.compileAddColumn(blueprint, command));
                    break;
                case "dropColumn":
                    statements.push(...this.compileDropColumn(blueprint, command));
                    break;
                case "renameColumn":
                    statements.push(...this.compileRenameColumn(blueprint, command));
                    break;
                case "addIndex":
                    statements.push(...this.compileAddIndex(blueprint, command));
                    break;
                case "dropIndex":
                    statements.push(...this.compileDropIndex(blueprint, command));
                    break;
                case "addForeignKey":
                    statements.push(...this.compileAddForeignKey(blueprint, command));
                    break;
                case "dropForeignKey":
                    statements.push(...this.compileDropForeignKey(blueprint, command));
                    break;
                default:
                    break;
            }
        }

        return statements.map(s => CompiledStatement.make(s));
    }

    compileInlineConstraints(blueprint) {
        return [];
    }

    compileAddColumn(blueprint, command) {
        const colSql = this.compileColumn(command.column);
        return [CompiledStatement.make(`ALTER TABLE ${this.wrap(blueprint.table)} ADD COLUMN ${colSql}`)];
    }

    compileDropColumn(blueprint, command) {
        if (!this.supports.dropColumn) {
            throw new Error(`[SchemaGrammar] Grammatical dialect does not support dropping columns.`);
        }
        return command.columns.map(col => CompiledStatement.make(`ALTER TABLE ${this.wrap(blueprint.table)} DROP COLUMN ${this.wrap(col)}`));
    }

    compileRenameColumn(blueprint, command) {
        if (!this.supports.renameColumn) {
            throw new Error(`[SchemaGrammar] Grammatical dialect does not support renaming columns.`);
        }
        return [CompiledStatement.make(`ALTER TABLE ${this.wrap(blueprint.table)} RENAME COLUMN ${this.wrap(command.from)} TO ${this.wrap(command.to)}`)];
    }

    compileAddIndex(blueprint, command) {
        const indexName = this.wrap(command.indexName);
        const columns = this.wrapArray(command.columns).join(", ");
        const table = this.wrap(blueprint.table);

        const indexType = command.indexType || command.type;
        if (indexType === "unique") {
            return [CompiledStatement.make(`CREATE UNIQUE INDEX ${indexName} ON ${table} (${columns})`)];
        }
        if (indexType === "primary") {
            return [CompiledStatement.make(`ALTER TABLE ${table} ADD PRIMARY KEY (${columns})`)];
        }

        return [CompiledStatement.make(`CREATE INDEX ${indexName} ON ${table} (${columns})`)];
    }

    compileDropIndex(blueprint, command) {
        return [CompiledStatement.make(`DROP INDEX ${this.wrap(command.indexName)}`)];
    }

    compileAddForeignKey(blueprint, command) {
        const fkPrefix = command.foreignKeyName ? `CONSTRAINT ${this.wrap(command.foreignKeyName)} ` : "";
        const cols = this.wrapArray(command.columns).join(", ");
        const targetTable = this.wrap(command.onTable);
        const targetCols = this.wrapArray(command.referencesColumns).join(", ");

        let sql = `${fkPrefix}FOREIGN KEY (${cols}) REFERENCES ${targetTable} (${targetCols})`;
        if (command.onDeleteAction) {
            sql += ` ON DELETE ${command.onDeleteAction}`;
        }
        if (command.onUpdateAction) {
            sql += ` ON UPDATE ${command.onUpdateAction}`;
        }

        if (blueprint.creating) {
            return [sql];
        }

        return [CompiledStatement.make(`ALTER TABLE ${this.wrap(blueprint.table)} ADD ${sql}`)];
    }

    compileDropForeignKey(blueprint, command) {
        return [CompiledStatement.make(`ALTER TABLE ${this.wrap(blueprint.table)} DROP CONSTRAINT ${this.wrap(command.foreignKeyName)}`)];
    }

    compileRenameTable(from, to) {
        return CompiledStatement.make(`ALTER TABLE ${this.wrap(from)} RENAME TO ${this.wrap(to)}`);
    }

    compileDropTable(table) {
        return CompiledStatement.make(`DROP TABLE ${this.wrap(table)}`);
    }

    compileDropTableIfExists(table) {
        return CompiledStatement.make(`DROP TABLE IF EXISTS ${this.wrap(table)}`);
    }

    compileHasTable(table) {
        throw new Error("[SchemaGrammar] compileHasTable must be implemented by subclass.");
    }

    compileHasColumn(table, column) {
        throw new Error("[SchemaGrammar] compileHasColumn must be implemented by subclass.");
    }

    compileColumn(column) {
        const typeSql = this.getType(column);
        let sql = `${this.wrap(column.name)} ${typeSql}`;

        sql += this.compileModifiers(column);

        return sql;
    }

    compileModifiers(column) {
        let sql = "";

        if (column.get("unsigned")) {
            sql += " UNSIGNED";
        }

        if (column.get("nullable") === false) {
            sql += " NOT NULL";
        } else if (column.get("nullable") === true) {
            sql += " NULL";
        }

        if (column.get("default") !== null) {
            sql += ` DEFAULT ${this.getDefaultValue(column.get("default"))}`;
        } else if (column.get("useCurrent")) {
            sql += " DEFAULT CURRENT_TIMESTAMP";
        }

        if (column.get("autoIncrement")) {
            sql += " AUTO_INCREMENT";
        }

        if (column.get("primary")) {
            sql += " PRIMARY KEY";
        }

        if (column.get("unique")) {
            sql += " UNIQUE";
        }

        if (column.get("comment")) {
            sql += ` COMMENT '${column.get("comment").replace(/'/g, "''")}'`;
        }

        if (column.get("after")) {
            if (this.supports.after) {
                sql += ` AFTER ${this.wrap(column.get("after"))}`;
            }
        }

        if (column.get("first")) {
            if (this.supports.first) {
                sql += " FIRST";
            }
        }

        return sql;
    }

    getDefaultValue(value) {
        if (typeof value === "number") return String(value);
        if (typeof value === "boolean") return value ? "1" : "0";
        if (value === null || value === undefined) return "NULL";
        return `'${String(value).replace(/'/g, "''")}'`;
    }

    getType(column) {
        const methodName = `type${column.type.charAt(0).toUpperCase()}${column.type.slice(1)}`;
        if (typeof this[methodName] === "function") {
            return this[methodName](column);
        }
        return column.type.toUpperCase();
    }

    // Default Type Mappings

    typeString(column) {
        const length = column.parameters.length || 255;
        return `VARCHAR(${length})`;
    }

    typeText() {
        return "TEXT";
    }

    typeInteger() {
        return "INTEGER";
    }

    typeBigInteger() {
        return "BIGINT";
    }

    typeFloat(column) {
        const precision = column.parameters.precision || 8;
        const scale = column.parameters.scale || 2;
        return `FLOAT(${precision}, ${scale})`;
    }

    typeDouble(column) {
        const precision = column.parameters.precision || 8;
        const scale = column.parameters.scale || 2;
        return `DOUBLE(${precision}, ${scale})`;
    }

    typeDecimal(column) {
        const precision = column.parameters.precision || 8;
        const scale = column.parameters.scale || 2;
        return `DECIMAL(${precision}, ${scale})`;
    }

    typeBoolean() {
        return "BOOLEAN";
    }

    typeDate() {
        return "DATE";
    }

    typeDatetime() {
        return "DATETIME";
    }

    typeTimestamp() {
        return "TIMESTAMP";
    }

    typeJson() {
        return "JSON";
    }

    typeUuid() {
        return "VARCHAR(36)";
    }

    typeBinary() {
        return "BLOB";
    }
}
