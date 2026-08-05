export default {
    default: process.env.LOG_CHANNEL || "single",
    channels: {
        single: { driver: "single", path: "storage/logs/app.log" },
    },
};
