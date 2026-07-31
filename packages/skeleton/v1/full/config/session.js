export default {
  driver: process.env.SESSION_DRIVER || 'cookie',
  lifetime: 120,
  expire_on_close: false,
  encrypt: true,
  path: '/',
  domain: null,
  secure: false,
  http_only: true,
  same_site: 'lax'
};
