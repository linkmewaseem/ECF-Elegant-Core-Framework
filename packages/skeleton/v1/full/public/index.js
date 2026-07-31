import { HttpAdapter } from '../../../../http/src/index.js';
import { createApp } from '../bootstrap/app.js';
import httpConfig from '../config/http.js';

const { router } = createApp();

const adapter = new HttpAdapter();
adapter.onRequest(async (req, res) => {
  try {
    const route = router.match(req);
    const action = route.action;
    return await action(req, res);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  adapter.listen(httpConfig.port, httpConfig.host, () => {
    console.log(`🚀 ECF Enterprise Server running on http://${httpConfig.host}:${httpConfig.port}`);
  });
}

export { adapter, router };
