export default {
    default: process.env.MAIL_MAILER || "log",
    mailers: {
        smtp: {
            transport: "smtp",
            host: process.env.MAIL_HOST || "127.0.0.1",
            port: process.env.MAIL_PORT || 1025,
            username: process.env.MAIL_USERNAME || null,
            password: process.env.MAIL_PASSWORD || null,
            encryption: process.env.MAIL_ENCRYPTION || null,
        },
        log: {
            transport: "log",
        },
        memory: {
            transport: "memory",
        },
    },
    from: {
        address: process.env.MAIL_FROM_ADDRESS || "hello@ecfapp.com",
        name: process.env.MAIL_FROM_NAME || "ECF Application",
    },
};
