// Mock Redis client for development
// TODO: Replace with actual Upstash Redis client in production

interface CacheStore {
  [key: string]: {
    value: string;
    expiry: number | null;
  };
}

const cache: CacheStore = {};

export const redis = {
  async get(key: string): Promise<string | null> {
    const item = cache[key];
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      delete cache[key];
      return null;
    }
    return item.value;
  },

  async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    cache[key] = {
      value,
      expiry: options?.ex ? Date.now() + options.ex * 1000 : null,
    };
    return 'OK';
  },

  async del(key: string): Promise<number> {
    if (cache[key]) {
      delete cache[key];
      return 1;
    }
    return 0;
  },

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Object.keys(cache).filter((key) => regex.test(key));
  },
};

export default redis;
