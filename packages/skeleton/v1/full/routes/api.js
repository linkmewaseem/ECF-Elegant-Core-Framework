export default function registerApiRoutes(router) {
  router.group({ prefix: '/api' }, (r) => {
    r.get('/v1/status', (req, res) => res.json({ status: 'ok', api: 'v1' }));
  });
}
