import { createWebhookProcessor } from '../_lib/premiumHandlers.js';

// Web-standard handler (not (req, res)) so the body arrives as the exact bytes Stripe signed.
export const config = { maxDuration: 15 };

const processWebhook = createWebhookProcessor();

export async function POST(request) {
  const raw = Buffer.from(await request.arrayBuffer());
  const { status, body } = await processWebhook(raw, request.headers.get('stripe-signature'));
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
