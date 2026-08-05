import assert from 'node:assert';
import { ITestDatabase } from '@ecfjs/contracts';

/**
 * Test Database Sandbox & Assertions.
 */
export class TestDatabase extends ITestDatabase {
  constructor(dbManager = null) {
    super();
    this.db = dbManager || globalThis.__ECF_DB__ || null;
    this.inMemoryTables = new Map();
  }

  async useTransaction() {
    if (this.db && typeof this.db.beginTransaction === 'function') {
      await this.db.beginTransaction();
    }
  }

  async rollbackTransaction() {
    if (this.db && typeof this.db.rollback === 'function') {
      await this.db.rollback();
    }
  }

  async refresh() {
    this.inMemoryTables.clear();
    if (this.db && typeof this.db.migrateRefresh === 'function') {
      await this.db.migrateRefresh();
    }
  }

  /**
   * Seed database table in memory for testing sandbox assertions.
   */
  seedTable(table, records = []) {
    this.inMemoryTables.set(table, [...records]);
  }

  getRecords(table) {
    if (this.inMemoryTables.has(table)) {
      return this.inMemoryTables.get(table);
    }
    return [];
  }

  assertDatabaseHas(table, data = {}) {
    const records = this.getRecords(table);
    const found = records.some((r) => {
      return Object.entries(data).every(([k, v]) => r[k] === v);
    });

    assert.ok(
      found,
      `Expected table "${table}" to contain matching record ${JSON.stringify(data)}, but found none.`
    );
  }

  assertDatabaseMissing(table, data = {}) {
    const records = this.getRecords(table);
    const found = records.some((r) => {
      return Object.entries(data).every(([k, v]) => r[k] === v);
    });

    assert.ok(
      !found,
      `Expected table "${table}" NOT to contain matching record ${JSON.stringify(data)}, but it was found.`
    );
  }

  assertDatabaseCount(table, expectedCount) {
    const records = this.getRecords(table);
    assert.strictEqual(
      records.length,
      expectedCount,
      `Expected table "${table}" to contain ${expectedCount} records, but found ${records.length}.`
    );
  }

  assertSoftDeleted(table, data = {}) {
    const records = this.getRecords(table);
    const found = records.some((r) => {
      const matchData = Object.entries(data).every(([k, v]) => r[k] === v);
      return matchData && (r.deleted_at !== null && r.deleted_at !== undefined);
    });

    assert.ok(
      found,
      `Expected soft-deleted record in table "${table}" for ${JSON.stringify(data)}, but none was found.`
    );
  }

  assertModelExists(model) {
    assert.ok(model, `Expected model to exist.`);
    assert.ok(model.id || model.exists, `Expected model to be persisted in database.`);
  }

  assertModelMissing(model) {
    assert.ok(!model || !model.exists, `Expected model NOT to exist in database.`);
  }

  assertHas(table, data) { return this.assertDatabaseHas(table, data); }
  assertMissing(table, data) { return this.assertDatabaseMissing(table, data); }
  assertCount(table, count) { return this.assertDatabaseCount(table, count); }
}

export default TestDatabase;
