// Redis Configuration
// Redis client setup for caching and sessions

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    // Check if Redis configuration is available
    if (!process.env.REDIS_HOST) {
      console.log('⚠️  Redis configuration not found - running without Redis (caching disabled)');
      this.client = null;
      this.isConnected = false;
      return;
    }

    try {
      // Create Redis client
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3
      });

      // Handle connection events
      this.client.on('connect', () => {
        console.log('📡 Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis client disconnected');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      console.log('⚠️  Continuing without Redis (caching disabled)');
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Set a key-value pair with expiration
   * @param {string} key - Redis key
   * @param {number} seconds - Expiration in seconds
   * @param {string} value - Value to store
   * @returns {Promise<string>} Redis response
   */
  async setex(key, seconds, value) {
    if (!this.client || !this.isConnected) {
      console.log(`⚠️  Redis not available - would set ${key} for ${seconds}s`);
      return 'OK';
    }

    try {
      return await this.client.setEx(key, seconds, value);
    } catch (error) {
      console.error('Redis setex error:', error);
      throw error;
    }
  }

  /**
   * Get value by key
   * @param {string} key - Redis key
   * @returns {Promise<string|null>} Value or null
   */
  async get(key) {
    if (!this.client || !this.isConnected) {
      console.log(`⚠️  Redis not available - would get ${key}`);
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   * @param {string} key - Redis key
   * @returns {Promise<number>} Number of keys deleted
   */
  async del(key) {
    if (!this.client || !this.isConnected) {
      console.log(`⚠️  Redis not available - would delete ${key}`);
      return 1;
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return 0;
    }
  }

  /**
   * Set a key-value pair
   * @param {string} key - Redis key
   * @param {string} value - Value to store
   * @returns {Promise<string>} Redis response
   */
  async set(key, value) {
    if (!this.client || !this.isConnected) {
      console.log(`⚠️  Redis not available - would set ${key}`);
      return 'OK';
    }

    try {
      return await this.client.set(key, value);
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Redis key
   * @returns {Promise<number>} 1 if exists, 0 if not
   */
  async exists(key) {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error('Redis exists error:', error);
      return 0;
    }
  }

  /**
   * Set expiration for a key
   * @param {string} key - Redis key
   * @param {number} seconds - Expiration in seconds
   * @returns {Promise<number>} 1 if timeout was set, 0 if key doesn't exist
   */
  async expire(key, seconds) {
    if (!this.client || !this.isConnected) {
      return 1;
    }

    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
      return 0;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create and export Redis client instance
const redisClient = new RedisClient();
module.exports = redisClient;