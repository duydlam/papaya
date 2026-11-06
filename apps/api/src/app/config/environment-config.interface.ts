export interface EnvironmentConfig {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  DB_SCHEMA?: string;
  DB_SYNC?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  REDIS_DB?: string;
  JWT_SECRET?: string;
  DEMO_USERNAME?: string;
  DEMO_PASSWORD?: string;
  NODE_ENV?: string;
  PORT?: string;
  WEB_ORIGIN?: string;
}
