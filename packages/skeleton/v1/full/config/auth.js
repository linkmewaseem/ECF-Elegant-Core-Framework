export default {
  defaults: {
    guard: 'session'
  },
  guards: {
    session: { driver: 'session' },
    api: { driver: 'jwt' }
  }
};
