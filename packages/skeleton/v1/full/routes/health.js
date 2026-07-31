export default function registerHealthRoutes(router) {
  router.get('/health', async (req, res) => {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      framework: 'ECF v1.0',
      uptime: process.uptime()
    });
  });
}
