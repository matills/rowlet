import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

class RedisClient {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.client = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis client connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis client error:', error);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis client connection closed');
      });
    } catch (error) {
      logger.error('Failed to create Redis client:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not available, skipping cache get');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not available, skipping cache set');
      return false;
    }

    try {
      const stringValue = JSON.stringify(value);

      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }

      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not available, skipping cache delete');
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not available, skipping cache delete pattern');
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error('Redis delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL of key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -2;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

export const redis = new RedisClient();
