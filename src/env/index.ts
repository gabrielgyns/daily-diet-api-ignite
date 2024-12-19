import "dotenv/config";

import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
	config({ path: ".env.test" });
	console.log("🧪 Using .env.test file");
} else {
	config();
}

const evnSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
	DATABASE_URL: z.string(),
	PORT: z.number().default(3333),
});

const _env = evnSchema.safeParse(process.env);

if (!_env.success) {
	console.error("😕 Invalid environment variables", _env.error.format());
	throw new Error("Invalid environment variables");
}

export const env = _env.data;
