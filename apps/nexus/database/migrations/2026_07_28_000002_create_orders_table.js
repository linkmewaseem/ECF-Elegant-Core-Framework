import { Migration } from "@ecf/database";

export default class CreateOrdersTable extends Migration {
    async up(schema) {
        await schema.create("orders", (table) => {
            table.id();
            table.foreignId("product_id").constrained("products");
            table.integer("quantity");
            table.decimal("total_price", 10, 2);
            table.timestamp("created_at").nullable();
        });
    }

    async down(schema) {
        await schema.dropIfExists("orders");
    }
}
