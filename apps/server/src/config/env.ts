import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "testing", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  HOST: z.string().min(1),

  // Database
  DATABASE_URL: z.url(),
});

export const env = envSchema.parse({
  ...process.env,
});
