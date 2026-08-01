/**
 * ProfileRegistry — Global registry for named Media Profiles.
 * Used by MediaManager to resolve profile("product") style calls.
 */
export class ProfileRegistry {
  #profiles = new Map();

  /**
   * Register a MediaProfile instance under its name.
   * @param {import('../profiles/MediaProfile.js').MediaProfile} profile
   */
  register(profile) {
    this.#profiles.set(profile.getName(), profile);
    return this;
  }

  /**
   * Register multiple profiles at once.
   * @param {import('../profiles/MediaProfile.js').MediaProfile[]} profiles
   */
  registerMany(profiles) {
    for (const p of profiles) this.register(p);
    return this;
  }

  /**
   * Resolve a profile by name.
   * @param {string} name
   * @returns {import('../profiles/MediaProfile.js').MediaProfile}
   */
  resolve(name) {
    const profile = this.#profiles.get(name);
    if (!profile) {
      throw new Error(`Media profile not found: ${name}`);
    }
    return profile;
  }

  has(name) { return this.#profiles.has(name); }
  names() { return [...this.#profiles.keys()]; }
}

export default ProfileRegistry;
