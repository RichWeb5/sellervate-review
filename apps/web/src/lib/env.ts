import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  DEMO_PASSWORD: z.string().min(1),
});

export const env = schema.parse(process.env);
