export default {
  default: process.env.MAIL_MAILER || 'smtp',
  mailers: {
    smtp: {
      transport: 'smtp',
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.MAIL_PORT || 2525
    }
  },
  from: {
    address: process.env.MAIL_FROM_ADDRESS || 'hello@example.com',
    name: process.env.MAIL_FROM_NAME || 'ECF App'
  }
};
