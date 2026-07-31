export default {
  default: process.env.DB_CONNECTION || 'sqlite',
  connections: {
    sqlite: {
      driver: 'sqlite',
      database: process.env.DB_DATABASE || ':memory:',
      prefix: ''
    },
    mysql: {
      driver: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_DATABASE || 'ecf_app',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || ''
    },
    postgres: {
      driver: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'ecf_app',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || ''
    }
  }
};
