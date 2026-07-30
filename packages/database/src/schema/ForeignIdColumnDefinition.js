import ColumnDefinition from "./ColumnDefinition.js";
import { AddForeignKeyCommand } from "./Command.js";

export default class ForeignIdColumnDefinition extends ColumnDefinition {
    #blueprint;
    #foreignKeyCommand = null;

    constructor(blueprint, type, name, parameters = {}) {
        super(type, name, parameters);
        this.#blueprint = blueprint;
        this.unsigned(true);
    }

    /**
     * Define a foreign key constraint for this column.
     * @param {string|null} table Target table name. If omitted, pluralized/derived from column (e.g. 'user_id' -> 'users')
     * @param {string} column Target column name (defaults to 'id')
     * @param {string|null} indexName Explicit foreign key index name
     */
    constrained(table = null, column = "id", indexName = null) {
        let targetTable = table;
        if (!targetTable) {
            // Derived table name: 'user_id' -> 'users', 'category_id' -> 'categories'
            const base = this.name.replace(/_id$/, "");
            targetTable = base.endsWith("y") ? `${base.slice(0, -1)}ies` : `${base}s`;
        }

        const fkCommand = new AddForeignKeyCommand([this.name], indexName);
        fkCommand.references([column]).on(targetTable);

        this.#foreignKeyCommand = fkCommand;
        this.#blueprint.commands.push(fkCommand);

        return this;
    }

    onDelete(action) {
        if (this.#foreignKeyCommand) {
            this.#foreignKeyCommand.onDelete(action);
        }
        return this;
    }

    onUpdate(action) {
        if (this.#foreignKeyCommand) {
            this.#foreignKeyCommand.onUpdate(action);
        }
        return this;
    }

    cascadeOnDelete() {
        return this.onDelete("CASCADE");
    }

    nullOnDelete() {
        return this.onDelete("SET NULL");
    }

    restrictOnDelete() {
        return this.onDelete("RESTRICT");
    }

    cascadeOnUpdate() {
        return this.onUpdate("CASCADE");
    }
}
