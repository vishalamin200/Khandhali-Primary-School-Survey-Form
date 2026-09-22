import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token
  ? new Redis({ url, token, retry: { retries: 5, backoff: (n) => Math.min(2000, 100 * 2 ** n) } })
  : null;

export const KEY = "survey:responses";
