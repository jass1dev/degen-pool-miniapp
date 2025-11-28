import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  BOT_TOKEN: z.string(),
  TONCONNECT_MANIFEST_URL: z.string().url(),
  CONTRACT_ADDRESS: z.string(),
  OWNER_TON_ADDRESS: z.string(),
  ADMIN_TON_ADDRESS: z.string(),
  TONCENTER_API_KEY: z.string().optional().default(''),
  TONCENTER_ENDPOINT: z.string().url().optional().default('https://toncenter.com/api/v2/jsonRPC'),
  WEBAPP_URL: z.string().url(),
  WELCOME_IMAGE_URL: z.string().url().optional()
});

const parsed = envSchema.parse(process.env);

export const config = {
  botToken: parsed.BOT_TOKEN,
  manifestUrl: parsed.TONCONNECT_MANIFEST_URL,
  contractAddress: parsed.CONTRACT_ADDRESS,
  ownerAddress: parsed.OWNER_TON_ADDRESS,
  adminAddress: parsed.ADMIN_TON_ADDRESS,
  toncenterEndpoint: parsed.TONCENTER_ENDPOINT,
  toncenterKey: parsed.TONCENTER_API_KEY,
  webAppUrl: parsed.WEBAPP_URL,
  welcomeImageUrl: parsed.WELCOME_IMAGE_URL
};
