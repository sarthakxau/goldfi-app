import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://goldfi.vercel.app';
const FROM_EMAIL = 'gold.fi <noreply@goldfi.app>';

interface GiftEmailParams {
  recipientEmail: string;
  senderName: string;
  gramsAmount: number;
  inrAmount: number;
  occasion: string;
  message?: string;
  claimUrl: string;
}

export async function sendGiftNotification(params: GiftEmailParams) {
  const { recipientEmail, senderName, gramsAmount, inrAmount, occasion, message, claimUrl } = params;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; background: #FFFDF7; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; font-size: 24px; margin: 0 0 8px 0;">You've received gold!</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">${senderName} sent you a gift</p>
      </div>
      <div style="padding: 32px 24px;">
        <div style="background: #fff; border: 1px solid #E5E0D5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px 0;">${occasion}</p>
          <p style="font-size: 32px; font-weight: 700; color: #B8860B; margin: 0 0 4px 0;">${gramsAmount.toFixed(2)}g</p>
          <p style="font-size: 14px; color: #6B7280; margin: 0;">Worth &#8377;${inrAmount.toLocaleString('en-IN')}</p>
          ${message ? `<p style="font-size: 14px; color: #374151; margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #E5E0D5; font-style: italic;">"${message}"</p>` : ''}
        </div>
        <a href="${claimUrl}" style="display: block; background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); color: #fff; text-decoration: none; text-align: center; padding: 16px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Claim Your Gold
        </a>
        <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 16px 0 0 0;">
          Sign up or log in to add this gold to your vault. This gift expires in 30 days.
        </p>
      </div>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${senderName} sent you gold on gold.fi!`,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send gift email:', error);
    throw new Error('Failed to send gift notification email');
  }

  return data;
}

export function buildClaimUrl(claimToken: string): string {
  return `${APP_URL}/gift/claim/${claimToken}`;
}
