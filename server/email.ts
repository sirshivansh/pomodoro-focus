import { Resend } from "resend";
import nodemailer from "nodemailer";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith("re_") ? process.env.SMTP_PASS : undefined);
  if (apiKey) {
    return new Resend(apiKey);
  }
  return null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && !pass.startsWith("re_")) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<boolean> {
  const resend = getResendClient();
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #07070f; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f101f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #8cafff; }
          .code-box { background: rgba(255,255,255,0.05); border: 1px dashed rgba(140,175,255,0.4); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: monospace; }
          .footer { font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">PomoFocusTrack Security</div>
          </div>
          <h2 style="font-weight: 300; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Use the verification code below to complete your password reset:
          </p>
          <div class="code-box">
            <div class="code">${resetCode}</div>
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 13px; text-align: center;">
            This code will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.
          </p>
          <div class="footer">
            © 2026 PomoFocusTrack • Master Your Time
          </div>
        </div>
      </body>
    </html>
  `;

  // Option 1: Direct Resend API
  if (resend) {
    try {
      const fromEmail = "onboarding@resend.dev";
      console.log(`[EMAIL SERVICE] Attempting to send email via Resend API to ${toEmail}...`);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: "PomoFocusTrack - Password Reset Code",
        html: htmlContent,
      });

      if (error) {
        console.error(`[EMAIL SERVICE RESEND ERROR]:`, error);
      } else {
        console.log(`[EMAIL SERVICE RESEND SUCCESS]: Email sent! ID: ${data?.id}`);
        return true;
      }
    } catch (err: any) {
      console.error(`[EMAIL SERVICE RESEND EXCEPTION]:`, err.message || err);
    }
  }

  // Option 2: Generic SMTP
  if (transporter) {
    try {
      const fromEmail = process.env.FROM_EMAIL || "PomoFocusTrack Security <onboarding@resend.dev>";
      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: "PomoFocusTrack - Password Reset Code",
        html: htmlContent,
      });
      console.log(`[EMAIL SERVICE SMTP SUCCESS] Password reset email sent to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[EMAIL SERVICE SMTP ERROR]:`, err.message || err);
    }
  }

  // Fallback console log
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE CONSOLE LOG]`);
  console.log(`To: ${toEmail}`);
  console.log(`Subject: PomoFocusTrack - Password Reset Code`);
  console.log(`Reset Code: ${resetCode}`);
  console.log(`==================================================\n`);
  return true;
}
