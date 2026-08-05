export default {
    host: process.env.HTTP_HOST || "127.0.0.1",
    port: parseInt(process.env.HTTP_PORT || "3000", 10),
    middleware: ["global_logger"],
};
