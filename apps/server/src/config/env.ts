import { z } from "zod";
import dotenv from "dotenv";

const runtimeEnv = process.env.NODE_ENV ?? "development";

const envFile: Record<string, string> = {
  development: ".env.development.local",
  testing: ".env.testing.local",
  production: ".env",
};

dotenv.config({ path: envFile[runtimeEnv] });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "testing", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535),

  // Database
  DATABASE_URL: z.url(),
});

export const env = envSchema.parse({
  ...process.env,
  NODE_ENV: runtimeEnv, // ensure it exists
});
