export class ApiProfileManager {
  constructor() {
    this.profiles = new Map();
    this.registerDefaultProfiles();
  }

  registerDefaultProfiles() {
    this.profiles.set("mobile", {
      sparseFields: true,
      cursorPagination: true,
      maxPerPage: 15,
      compress: true,
    });
    this.profiles.set("desktop", {
      sparseFields: false,
      cursorPagination: false,
      maxPerPage: 50,
      compress: true,
    });
    this.profiles.set("minimal", {
      sparseFields: true,
      maxPerPage: 5,
      compress: true,
    });
  }

  getProfile(name) {
    return this.profiles.get(name) || this.profiles.get("desktop");
  }

  register(name, config) {
    this.profiles.set(name, config);
    return this;
  }
}

export default ApiProfileManager;
