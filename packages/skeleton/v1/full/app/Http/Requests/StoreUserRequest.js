import { FormRequest } from '../../../../../../http/src/index.js';

export class StoreUserRequest extends FormRequest {
  rules() {
    return {
      name: ['required'],
      email: ['required', 'email']
    };
  }
}

export default StoreUserRequest;
