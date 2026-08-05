import { FormRequest } from "@ecf/http";

export class StoreUserRequest extends FormRequest {
    rules() {
        return {
            name: ["required"],
            email: ["required", "email"],
        };
    }
}

export default StoreUserRequest;
