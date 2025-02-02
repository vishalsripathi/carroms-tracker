// src/services/emailService.ts
import { Match } from '../types/match';
import { Player } from '../types/player';

interface EmailTemplate {
  subject: string;
  html: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private readonly API_ENDPOINT = 'https://carrom-tracker.vishalsripathi.in/.netlify/functions/send-email';

  private async sendEmail(emailData: EmailData) {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
  
      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private getEmailTemplate(templateName: string, data: any): EmailTemplate {
    const commonStyles = `
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { padding: 20px; border-radius: 8px 8px 0 0; }
      .content { padding: 20px; border-radius: 0 0 8px 8px; }
      .button { 
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      }
      .footer { margin-top: 20px; font-size: 12px; text-align: center; }
    `;

    const darkModeStyles = `
      @media (prefers-color-scheme: dark) {
        body { background-color: #1e293b !important; color: #f8fafc !important; }
        .container { background-color: #0f172a !important; }
        .header { background-color: #2d3748 !important; }
        .content { background-color: #1e293b !important; }
        .button { 
          background-color: #3b82f6 !important; 
          color: #ffffff !important; 
        }
        .footer { color: #94a3b8 !important; }
      }
    `;

    switch (templateName) {
      case 'playerCreated':
        return {
          subject: 'Welcome to Carrom Tracker!',
          html: `
            <style>${commonStyles}${darkModeStyles}</style>
            <div class="container">
              <div class="header" style="background-color: #f8fafc; text-align: center;">
                <h1 style="color: #3b82f6; margin: 0;">Carrom Tracker</h1>
              </div>
              <div class="content" style="background-color: #ffffff;">
                <h2>Welcome ${data.name}! 🎉</h2>
                <p>Your player profile has been successfully created.</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Status:</strong> ${data.availability}</p>
                <a href="https://carrom-tracker.vishalsripathi.in/" class="button" 
                   style="background-color: #3b82f6; color: white;">
                  View Profile
                </a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
              </div>
            </div>
          `
        };

      case 'matchScheduled':
        return {
          subject: 'New Match Scheduled!',
          html: `
            <style>${commonStyles}${darkModeStyles}</style>
            <div class="container">
              <div class="header" style="background-color: #f8fafc; text-align: center;">
                <h1 style="color: #3b82f6; margin: 0;">Carrom Tracker</h1>
              </div>
              <div class="content" style="background-color: #ffffff;">
                <h2>New Match Scheduled 🎯</h2>
                <p>A new match has been scheduled:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
                  <p><strong>Team 1:</strong> ${data.team1Players.join(' & ')}</p>
                  <p><strong>Team 2:</strong> ${data.team2Players.join(' & ')}</p>
                </div>
                <a href="https://carrom-tracker.vishalsripathi.in/matches" class="button" 
                   style="background-color: #3b82f6; color: white;">
                  View Match Details
                </a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
              </div>
            </div>
          `
        };

      case 'matchRescheduled':
        return {
          subject: 'Match Rescheduled',
          html: `
            <style>${commonStyles}${darkModeStyles}</style>
            <div class="container">
              <div class="header" style="background-color: #f8fafc; text-align: center;">
                <h1 style="color: #3b82f6; margin: 0;">Carrom Tracker</h1>
              </div>
              <div class="content" style="background-color: #ffffff;">
                <h2>Match Rescheduled ⏰</h2>
                <p>A match has been rescheduled:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  <p><strong>Previous Date:</strong> ${new Date(data.oldDate).toLocaleString()}</p>
                  <p><strong>New Date:</strong> ${new Date(data.newDate).toLocaleString()}</p>
                  <p><strong>Team 1:</strong> ${data.team1Players.join(' & ')}</p>
                  <p><strong>Team 2:</strong> ${data.team2Players.join(' & ')}</p>
                </div>
                <a href="https://carrom-tracker.vishalsripathi.in/matches" class="button" 
                   style="background-color: #3b82f6; color: white;">
                  View Match Details
                </a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
              </div>
            </div>
          `
        };

      case 'matchCompleted':
        return {
          subject: 'Match Results',
          html: `
            <style>${commonStyles}${darkModeStyles}</style>
            <div class="container">
              <div class="header" style="background-color: #f8fafc; text-align: center;">
                <h1 style="color: #3b82f6; margin: 0;">Carrom Tracker</h1>
              </div>
              <div class="content" style="background-color: #ffffff;">
                <h2>Match Results 🏆</h2>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  <p><strong>Team 1:</strong> ${data.team1Players.join(' & ')}</p>
                  <p><strong>Team 2:</strong> ${data.team2Players.join(' & ')}</p>
                  <h3 style="text-align: center; margin: 15px 0;">
                    ${data.team1Score} - ${data.team2Score}
                  </h3>
                  <p style="text-align: center; color: #3b82f6;">
                    Winner: Team ${data.winner === 'team1' ? '1' : '2'} 🎉
                  </p>
                </div>
                <a href="https://carrom-tracker.vishalsripathi.in/matches" class="button" 
                   style="background-color: #3b82f6; color: white;">
                  View Match Details
                </a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
              </div>
            </div>
          `
        };

      default:
        throw new Error(`Unknown email template: ${templateName}`);
    }
  }

  async sendPlayerCreatedEmail(player: Player) {
    const template = this.getEmailTemplate('playerCreated', {
      name: player.name,
      email: player.email,
      availability: player.availability.status
    });

    return this.sendEmail({
      to: player.email,
      ...template
    });
  }

  async sendMatchScheduledEmail(match: Match, recipients: string[]) {
    const template = this.getEmailTemplate('matchScheduled', {
      date: match.date,
      team1Players: match.teams.team1.players,
      team2Players: match.teams.team2.players
    });

    return Promise.all(
      recipients.map(recipient =>
        this.sendEmail({
          to: recipient,
          ...template
        })
      )
    );
  }

  async sendMatchRescheduledEmail(
    match: Match,
    oldDate: Date,
    recipients: string[]
  ) {
    const template = this.getEmailTemplate('matchRescheduled', {
      oldDate,
      newDate: match.date,
      team1Players: match.teams.team1.players,
      team2Players: match.teams.team2.players
    });

    return Promise.all(
      recipients.map(recipient =>
        this.sendEmail({
          to: recipient,
          ...template
        })
      )
    );
  }

  async sendMatchCompletedEmail(match: Match, recipients: string[]) {
    const template = this.getEmailTemplate('matchCompleted', {
      team1Players: match.teams.team1.players,
      team2Players: match.teams.team2.players,
      team1Score: match.teams.team1.score,
      team2Score: match.teams.team2.score,
      winner: match.winner
    });

    return Promise.all(
      recipients.map(recipient =>
        this.sendEmail({
          to: recipient,
          ...template
        })
      )
    );
  }

  // Test function
  async sendTestEmail() {
    const template = {
      subject: 'Test Email from Carrom Tracker',
      html: `
        <style>${this.getEmailTemplate('playerCreated', {}).html}</style>
        <div class="container">
          <div class="header" style="background-color: #f8fafc; text-align: center;">
            <h1 style="color: #3b82f6; margin: 0;">Carrom Tracker</h1>
          </div>
          <div class="content" style="background-color: #ffffff;">
            <h2>Test Email 🧪</h2>
            <p>This is a test email to verify the email service integration.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <p>If you're seeing this email, the email service is working correctly!</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail({
      to: 'sripathivishalreddy@gmail.com',
      ...template
    });
  }
}

export const emailService = new EmailService();