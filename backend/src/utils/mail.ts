import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1025'),
  secure: false,
});

export async function sendMagicLink(email: string, token: string): Promise<number> {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@planti.app',
      to: email,
      subject: 'Your Planti Login Link',
      text: `Click here to log in to Planti: ${magicLink}`,
      html: `
      <div>
        <h1>Welcome to Planti!</h1>
        <p>Click the button below to log in to your account:</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer; text-decoration: none;">
          Log in to Planti
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${magicLink}</p>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `,
    });
    return 200;
  } catch (error) {
    console.error('Error sending magic link:', error);
    return 500;
  }
} 