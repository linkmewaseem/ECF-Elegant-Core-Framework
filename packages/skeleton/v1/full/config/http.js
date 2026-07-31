export default {
  adapter: process.env.HTTP_ADAPTER || 'native', // native | express | fastify
  port: parseInt(process.env.HTTP_PORT || '3000', 10),
  host: process.env.HTTP_HOST || '0.0.0.0',
  middleware: [
    'global_logger'
  ]
};
