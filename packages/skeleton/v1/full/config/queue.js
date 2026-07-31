export default {
  default: process.env.QUEUE_CONNECTION || 'sync',
  connections: {
    sync: { driver: 'sync' },
    database: { driver: 'database', table: 'jobs', queue: 'default' }
  }
};
