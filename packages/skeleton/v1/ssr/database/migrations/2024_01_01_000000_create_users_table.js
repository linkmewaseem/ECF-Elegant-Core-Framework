import { Schema } from "@ecfjs/database";

export async function up() {
    await Schema.create("users", (table) => {
        table.uuid("id").primary();
        table.string("name");
        table.string("email").unique();
        table.string("password");
        table.timestamp("email_verified_at").nullable();
        table.string("verification_token").nullable();
        table.string("reset_password_token").nullable();
        table.timestamp("reset_password_expires_at").nullable();
        table.string("remember_token").nullable();
        table.timestamps();
    });
}

export async function down() {
    await Schema.dropIfExists("users");
}
