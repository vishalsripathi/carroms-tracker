// src/services/emailService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase'; 

export type EmailTemplate = 
  | 'match-scheduled'
  | 'match-rescheduled'
  | 'match-cancelled'
  | 'match-reminder'
  | 'match-completed';

interface EmailData {
  template: EmailTemplate;
  recipients: string[];
  data: Record<string, any>;
}

export class EmailService {
  private static instance: EmailService;
  private functions;
  
  private constructor() {
    this.functions = getFunctions(app);
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const sendEmail = httpsCallable(this.functions, 'sendEmail');
      await sendEmail(emailData);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendMatchScheduledNotification(matchId: string, players: string[], date: Date) {
    await this.sendEmail({
      template: 'match-scheduled',
      recipients: players,
      data: {
        matchId,
        date: date.toISOString(),
      }
    });
  }

  async sendMatchRescheduledNotification(
    matchId: string,
    players: string[],
    oldDate: Date,
    newDate: Date
  ) {
    await this.sendEmail({
      template: 'match-rescheduled',
      recipients: players,
      data: {
        matchId,
        oldDate: oldDate.toISOString(),
        newDate: newDate.toISOString(),
      }
    });
  }

  async sendMatchCancelledNotification(
    matchId: string,
    players: string[],
    reason?: string
  ) {
    await this.sendEmail({
      template: 'match-cancelled',
      recipients: players,
      data: {
        matchId,
        reason,
      }
    });
  }

  async sendMatchReminder(matchId: string, players: string[], date: Date) {
    await this.sendEmail({
      template: 'match-reminder',
      recipients: players,
      data: {
        matchId,
        date: date.toISOString(),
      }
    });
  }

  async testEmailService() {
    try {
      await emailService.sendMatchScheduledNotification(
        'test-match-id',
        ['vishalreddy861@gmail.com'],
        new Date()
      );
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Test email failed:', error);
    }
  }

  async sendMatchCompletedNotification(
    matchId: string,
    players: string[],
    scores: { team1: number; team2: number }
  ) {
    await this.sendEmail({
      template: 'match-completed',
      recipients: players,
      data: {
        matchId,
        scores,
      }
    });
  }
  
}

export const emailService = EmailService.getInstance();