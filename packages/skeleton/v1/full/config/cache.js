export default {
  default: process.env.CACHE_DRIVER || 'memory',
  stores: {
    memory: { driver: 'memory' },
    file: { driver: 'file', path: 'storage/framework/cache' }
  }
};
