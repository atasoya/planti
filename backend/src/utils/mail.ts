import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const plantiGreen900 = "#0F2A1D";
const plantiGreen800 = "#375534";
const plantiGreen700 = "#6B9071";
const plantiGreen500 = "#E3EED4";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "localhost",
  port: parseInt(process.env.MAIL_PORT || "1025"),
  secure: false,
});

export async function sendMagicLink(email: string, token: string): Promise<number> {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  try {
    await transporter.sendMail({
      from: `Planti <${process.env.MAIL_FROM || "noreply@planti.app"}>`,
      to: email,
      subject: "🪴 Your Planti Login Link",
      text: `Click this link to log in to Planti: ${magicLink} - This link expires in 10 minutes.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planti Login</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; background-color: ${plantiGreen500}; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: ${plantiGreen900}; font-size: 28px; margin: 0; }
    .content p { color: ${plantiGreen800}; line-height: 1.6; }
    .button { display: inline-block; background-color: ${plantiGreen800}; color: #ffffff !important; padding: 12px 25px; margin: 20px 0; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; font-size: 16px; font-weight: bold; text-align: center; }
    .button:hover { background-color: ${plantiGreen900}; }
    .link { color: ${plantiGreen700}; word-break: break-all; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: ${plantiGreen700}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪴 Welcome to Planti!</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Click the button below to securely log in to your Planti account. No password needed!</p>
      <div style="text-align: center;">
          <a href="${magicLink}" class="button">Log in to Planti</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p><a href="${magicLink}" class="link">${magicLink}</a></p>
      <p>This magic link is valid for 10 minutes and can only be used once.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
    <div class="footer">
      Planti - Plant care made simple.
    </div>
  </div>
</body>
</html>
    `,
    });
    console.log(`Magic link sent to ${email}`);
    return 200;
  } catch (error) {
    console.error('Error sending magic link:', error);
    return 500;
  }
} 