import { Model } from "@ecfjs/database";
import TimestampsPlugin from "@ecfjs/timestamps";
import UuidsPlugin from "@ecfjs/uuids";
import { PasswordHasher } from "@ecfjs/auth";

const passwordHasher = new PasswordHasher();

export class User extends Model {
    static table = "users";
    static primaryKey = "id";
    static keyType = "string";
    static incrementing = false;

    static fillable = [
        "id",
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

User.use(TimestampsPlugin);
User.use(UuidsPlugin);

export default User;
