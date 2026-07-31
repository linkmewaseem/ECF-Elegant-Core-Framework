export default {
  default: process.env.FILESYSTEM_DISK || 'local',
  disks: {
    local: {
      driver: 'local',
      root: 'storage/app'
    },
    public: {
      driver: 'local',
      root: 'storage/app/public',
      url: '/storage'
    }
  }
};
