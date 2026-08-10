import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard Gmail SMTP
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS, // App Password, not real password
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP credentials not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CareerOS" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error({ err: error }, `Failed to send email to ${to}`);
  }
};
