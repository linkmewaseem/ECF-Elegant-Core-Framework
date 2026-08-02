import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test, ModelFactory, Seeder } from '../../src/index.js';

describe('TestDatabase, ModelFactory & Seeder Unit Tests', () => {
  test('should define factory, create records, and execute DB assertions', async ({ database, factory }) => {
    ModelFactory.define('User', (faker) => ({
      name: faker.name(),
      email: faker.email(),
      role: 'user',
    }));

    const userFactory = factory('User');
    const createdUser = await userFactory.create({ role: 'admin' });

    assert.strictEqual(createdUser.role, 'admin');

    database.seedTable('users', [
      { id: 1, name: 'Alice', role: 'admin', deleted_at: null },
      { id: 2, name: 'Bob', role: 'user', deleted_at: '2026-08-03' },
    ]);

    database.assertDatabaseHas('users', { id: 1, role: 'admin' });
    database.assertDatabaseMissing('users', { id: 99 });
    database.assertDatabaseCount('users', 2);
    database.assertSoftDeleted('users', { id: 2 });
  });

  test('should support DatabaseSeeder orchestration', async ({ app, database }) => {
    class UserSeeder extends Seeder {
      async run() {
        this.testDb.seedTable('users', [{ id: 10, name: 'Seeded User' }]);
      }
    }

    const mainSeeder = new Seeder(app, database);
    await mainSeeder.call(UserSeeder);

    database.assertDatabaseHas('users', { id: 10, name: 'Seeded User' });
  });
});
