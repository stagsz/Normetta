import * as nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const { email } = config;
    
    if (!email.smtpHost || !email.smtpPort || !email.smtpUser || !email.smtpPass) {
      throw new Error('Email SMTP configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host: email.smtpHost,
      port: email.smtpPort,
      secure: email.smtpSecure,
      auth: {
        user: email.smtpUser,
        pass: email.smtpPass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });

    return this.transporter;
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.getTransporter();
      
      const info = await transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

export const emailService = new EmailService();