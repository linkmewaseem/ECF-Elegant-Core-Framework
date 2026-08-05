import { Schema } from "@ecf/database";

export async function up() {
    await Schema.create("users", (table) => {
        table.uuid("id").primary();
        table.string("name");
        table.string("email").unique();
        table.string("password");
        table.timestamps();
    });
}

export async function down() {
    await Schema.drop("users");
}
