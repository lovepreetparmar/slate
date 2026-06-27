import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => i.path.join("."))
      .join(", ");
    throw new Error(`Invalid environment configuration: ${missing}`);
  }

  if (
    result.data.NODE_ENV === "production" &&
    !process.env.AUTH_SECRET
  ) {
    throw new Error("AUTH_SECRET is required in production");
  }

  return result.data;
}

export const env = parseEnv();
