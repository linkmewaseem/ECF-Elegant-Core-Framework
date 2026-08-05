import { FormRequest } from "@ecfjs/http";

export class StoreUserRequest extends FormRequest {
    rules() {
        return {
            name: ["required"],
            email: ["required", "email"],
        };
    }
}

export default StoreUserRequest;
