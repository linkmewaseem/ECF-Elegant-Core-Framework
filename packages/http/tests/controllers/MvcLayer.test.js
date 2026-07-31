import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  Controller, ResourceController, ControllerResolver, ModelBinder,
  FormRequest, JsonResource, ResourceCollection, NativeRequest, AbstractResponse, ValidationException
} from '../../src/index.js';

class MockUserModel {
  static async find(id) {
    if (id === '1') return { id: 1, name: 'Alice', email: 'alice@example.com' };
    return null;
  }
}

class UserController extends Controller {
  constructor() {
    super();
    this.middleware('auth', { except: ['index'] });
  }

  async index(req, res) {
    return [{ id: 1, name: 'Alice' }];
  }

  async show(req, res, user) {
    return new JsonResource(user).toResponse();
  }
}

class CustomUserRequest extends FormRequest {
  rules() {
    return {
      email: ['required', 'email']
    };
  }
}

test('Stage 2 - ModelBinder & ControllerResolver parameter injection', async () => {
  const modelBinder = new ModelBinder();
  modelBinder.bind('user', MockUserModel);

  const resolver = new ControllerResolver(null, modelBinder);
  const controller = resolver.resolveController(UserController);

  assert.deepEqual(controller.getMiddleware('index'), []);
  assert.deepEqual(controller.getMiddleware('show'), ['auth']);

  const req = new NativeRequest({ url: '/users/1', method: 'GET', headers: {} });
  const res = new AbstractResponse();

  const args = await resolver.resolveActionArguments(controller, 'show', req, res, { user: '1' });
  const result = await controller.show(...args);

  assert.deepEqual(result, {
    data: { id: 1, name: 'Alice', email: 'alice@example.com' }
  });
});

test('Stage 2 - FormRequest validates incoming payloads', async () => {
  const reqInvalid = new NativeRequest({
    url: '/users',
    method: 'POST',
    headers: {},
    body: { email: 'not-an-email' }
  });

  const formReq = new CustomUserRequest(reqInvalid);
  await assert.rejects(async () => {
    await formReq.validate();
  }, ValidationException);

  const reqValid = new NativeRequest({
    url: '/users',
    method: 'POST',
    headers: {},
    body: { email: 'john@example.com' }
  });
  const formReqValid = new CustomUserRequest(reqValid);
  const validated = await formReqValid.validate();
  assert.deepEqual(validated, { email: 'john@example.com' });
  assert.deepEqual(formReqValid.safe(['email']), { email: 'john@example.com' });
});

test('Stage 2 - JsonResource & ResourceCollection formatting', () => {
  const user = { id: 10, name: 'Bob', email: 'bob@example.com' };
  const resource = new JsonResource(user).additional({ meta: { version: '1.0' } });

  assert.deepEqual(resource.toResponse(), {
    data: { id: 10, name: 'Bob', email: 'bob@example.com' },
    meta: { version: '1.0' }
  });

  const collection = new ResourceCollection([{ id: 1 }, { id: 2 }]);
  assert.deepEqual(collection.toResponse(), {
    data: [{ id: 1 }, { id: 2 }]
  });
});
