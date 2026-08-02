import IPresenceRepository from "../contracts/IPresenceRepository.js";
import MemoryPresenceRepository from "./MemoryPresenceRepository.js";

export class RedisPresenceRepository extends IPresenceRepository {
  constructor(redisClient = null, prefix = "presence:") {
    super();
    this.redisClient = redisClient;
    this.prefix = prefix;
    this.memoryFallback = new MemoryPresenceRepository();
  }

  async join(channel, user) {
    if (!this.redisClient) return await this.memoryFallback.join(channel, user);

    const key = `${this.prefix}${channel}`;
    const userId = user.id || user.user_id || String(user);
    await this.redisClient.hset(key, userId, JSON.stringify(user));
    return user;
  }

  async leave(channel, userId) {
    if (!this.redisClient) return await this.memoryFallback.leave(channel, userId);

    const key = `${this.prefix}${channel}`;
    const count = await this.redisClient.hdel(key, userId);
    return count > 0;
  }

  async members(channel) {
    if (!this.redisClient) return await this.memoryFallback.members(channel);

    const key = `${this.prefix}${channel}`;
    const all = await this.redisClient.hgetall(key);
    return Object.values(all).map((item) => JSON.parse(item));
  }

  async count(channel) {
    if (!this.redisClient) return await this.memoryFallback.count(channel);

    const key = `${this.prefix}${channel}`;
    return await this.redisClient.hlen(key);
  }

  async exists(channel, userId) {
    if (!this.redisClient) return await this.memoryFallback.exists(channel, userId);

    const key = `${this.prefix}${channel}`;
    return (await this.redisClient.hexists(key, userId)) === 1;
  }
}

export default RedisPresenceRepository;
