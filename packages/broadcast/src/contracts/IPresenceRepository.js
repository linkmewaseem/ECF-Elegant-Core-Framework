export class IPresenceRepository {
  async join(channel, user) {
    throw new Error("Method 'join()' must be implemented.");
  }

  async leave(channel, userId) {
    throw new Error("Method 'leave()' must be implemented.");
  }

  async members(channel) {
    throw new Error("Method 'members()' must be implemented.");
  }

  async count(channel) {
    throw new Error("Method 'count()' must be implemented.");
  }

  async exists(channel, userId) {
    throw new Error("Method 'exists()' must be implemented.");
  }
}

export default IPresenceRepository;
