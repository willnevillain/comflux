import path from 'path';
import dotenv from 'dotenv';

const REPO_ROOT = path.join(__dirname, '../');
const DOT_ENV = path.join(REPO_ROOT, '.env');

dotenv.config({ path: DOT_ENV });

export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
export const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
export const NGROK_URL = process.env.NGROK_URL;
export const TWITCH_EVENTSUB_SECRET = process.env.TWITCH_EVENTSUB_SECRET;
