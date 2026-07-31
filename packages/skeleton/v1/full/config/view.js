export default {
  paths: ['resources/views'],
  extension: '.ecf',
  cache: process.env.APP_ENV === 'production',
  cache_path: 'storage/framework/views'
};
