export default class Migration {
    /**
     * Target connection name (optional override)
     * @type {string|null}
     */
    connection = null;

    /**
     * Run the migrations.
     * @param {import("../schema/SchemaBuilder.js").default} schema
     */
    async up(schema) {
        // To be implemented by subclass
    }

    /**
     * Reverse the migrations.
     * @param {import("../schema/SchemaBuilder.js").default} schema
     */
    async down(schema) {
        // To be implemented by subclass
    }
}
