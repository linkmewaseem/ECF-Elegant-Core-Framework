import { Migration } from "@ecf/database";

export default class CreateProductsTable extends Migration {
    async up(schema) {
        await schema.create("products", (table) => {
            table.id();
            table.string("name");
            table.string("category");
            table.decimal("price", 10, 2);
            table.integer("stock");
            table.string("sku").unique();
            table.timestamp("created_at").nullable();
        });
    }

    async down(schema) {
        await schema.dropIfExists("products");
    }
}
