import { Model } from '../../../../../database/src/index.js';

export class User extends Model {
  static table = 'users';
  static primaryKey = 'id';
  static fillable = ['name', 'email'];
}

export default User;
