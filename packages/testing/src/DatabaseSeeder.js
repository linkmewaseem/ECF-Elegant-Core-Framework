/**
 * Database Seeder Base Class & Orchestrator.
 */
export class DatabaseSeeder {
  constructor(app = null, testDb = null) {
    this.app = app;
    this.testDb = testDb;
  }

  async run() {
    // Override in concrete seeders
  }

  async call(seeders = []) {
    const list = Array.isArray(seeders) ? seeders : [seeders];
    for (const SeederClass of list) {
      const seeder = new SeederClass(this.app, this.testDb);
      await seeder.run();
    }
  }
}

export const Seeder = DatabaseSeeder;
export default DatabaseSeeder;
