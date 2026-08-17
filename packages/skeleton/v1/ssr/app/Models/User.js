import { Model } from "@ecfjs/database";
import { PasswordHasher } from "@ecfjs/auth";

const passwordHasher = new PasswordHasher();

export class User extends Model {
    static table = "users";
    static primaryKey = "id";

    static fillable = [
        "name",
        "email",
        "password",
        "email_verified_at",
        "verification_token",
        "reset_password_token",
        "reset_password_expires_at",
        "remember_token",
        "created_at",
        "updated_at"
    ];

    static hidden = ["password", "remember_token"];

    static async hashPassword(plainPassword) {
        return await passwordHasher.make(plainPassword);
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await passwordHasher.check(plainPassword, hashedPassword);
    }
}

export default User;
