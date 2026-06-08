import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_API_KEY is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY cannot be empty'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN cannot be empty'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID cannot be empty'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET cannot be empty'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID cannot be empty'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string({ error: 'NEXT_PUBLIC_FIREBASE_APP_ID is required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID cannot be empty'),
});

const _parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

if (!_parsed.success) {
  const missing = _parsed.error.issues.map((i) => i.message).join('\n  ');
  throw new Error(
    `\n\n[GetAWay] Missing required environment variables:\n  ${missing}\n\nCheck your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.\n`
  );
}

export const env = _parsed.data;
