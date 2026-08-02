import IPresenceRepository from "../contracts/IPresenceRepository.js";

export class MemoryPresenceRepository extends IPresenceRepository {
  constructor() {
    super();
    this.store = new Map();
  }

  async join(channel, user) {
    if (!this.store.has(channel)) {
      this.store.set(channel, new Map());
    }
    const membersMap = this.store.get(channel);
    const userId = user.id || user.user_id || String(user);
    membersMap.set(userId, user);
    return user;
  }

  async leave(channel, userId) {
    if (!this.store.has(channel)) return false;
    const membersMap = this.store.get(channel);
    const removed = membersMap.delete(userId);
    return removed;
  }

  async members(channel) {
    if (!this.store.has(channel)) return [];
    return Array.from(this.store.get(channel).values());
  }

  async count(channel) {
    if (!this.store.has(channel)) return 0;
    return this.store.get(channel).size;
  }

  async exists(channel, userId) {
    if (!this.store.has(channel)) return false;
    return this.store.get(channel).has(userId);
  }
}

export default MemoryPresenceRepository;
