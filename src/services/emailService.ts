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
  private readonly SUPPORT_EMAIL = 'sripathivishalreddy@gmail.com';
  private readonly APP_URL = 'https://carrom-tracker.vishalsripathi.in';

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
  
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Base styles for all emails
  private readonly baseStyles = `
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }

    .container {
      max-width: 600px;
      margin: 24px auto;
      background-color: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      color: #f8fafc;
    }

    .header {
      background-color: #4f46e5;
      padding: 24px;
      text-align: center;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      color: #ffffff;
    }

    .content {
      padding: 24px;
    }

    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
      color: #f8fafc;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      background-color: #2e3b4e;
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background-color: #374151;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #f8fafc;
    }

    td {
      padding: 12px;
      border-top: 1px solid #4b5563;
      color: #f8fafc;
    }

    .highlight {
      color: #818cf8;
      font-weight: 600;
    }

    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 16px 0;
      text-align: center;
    }

    .message {
      margin: 24px 0;
      text-align: center;
      color: #94a3b8;
    }

    .footer {
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
      border-top: 1px solid #374151;
    }
  `;

  private readonly commonFooter = `
    <div class="footer">
      <p>Questions or concerns? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #818cf8;">${this.SUPPORT_EMAIL}</a></p>
      <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
    </div>
  `;

  private getEmailTemplate(templateName: string, data: any): EmailTemplate {
    switch (templateName) {
      case 'playerCreated':
        return {
          subject: '🎯 Welcome to Carrom Tracker!',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <div class="avatar">${data.name[0]}</div>
                <h2 style="text-align: center; margin-bottom: 24px;">Welcome, ${data.name}! 🎉</h2>
                
                <div class="card">
                  <h3>Your Profile Details</h3>
                  <p><strong>Name:</strong> ${data.name}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span class="badge ${data.availability === 'available' ? 'badge-success' : 'badge-warning'}">
                      ${data.availability}
                    </span>
                  </p>
                </div>

                <div class="card">
                  <h3>Quick Start Guide</h3>
                  <ul style="padding-left: 20px;">
                    <li>Update your profile information</li>
                    <li>Join or create matches</li>
                    <li>Track your statistics</li>
                    <li>Connect with other players</li>
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/profile" class="button">
                    View Your Profile
                  </a>
                </div>
              </div>
              ${this.commonFooter}
            </div>
          `
        };

      case 'matchScheduled':
        return {
          subject: '🎯 New Match Scheduled!',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Hey there! Get ready for an exciting match! 🎯
                </div>

                <table>
                  <tr>
                    <th colspan="2">Match Details</th>
                  </tr>
                  <tr>
                    <td>Date & Time</td>
                    <td class="highlight">${new Date(data.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Team 1</td>
                    <td>${data.team1Players.join(' & ')}</td>
                  </tr>
                  <tr>
                    <td>Team 2</td>
                    <td>${data.team2Players.join(' & ')}</td>
                  </tr>
                </table>

                <div class="message">
                  Don't forget to warm up before the match! See you at the table! 🚀
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Match Details
                  </a>
                </div>
              </div>
              ${this.commonFooter}
            </div>
          `
        };

      case 'matchCompleted': {
        const winningTeam = data.winner === 'team1' ? 1 : 2;
        
        return {
          subject: `🏆 Match Results - Team ${winningTeam} Wins!`,
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Match Complete! Team ${winningTeam} Takes the Win! 🏆
                </div>

                <table>
                  <tr>
                    <th colspan="2">Match Results</th>
                  </tr>
                  <tr>
                    <td>Team 1 Score</td>
                    <td class="highlight">${data.team1Score}</td>
                  </tr>
                  <tr>
                    <td>Team 2 Score</td>
                    <td class="highlight">${data.team2Score}</td>
                  </tr>
                  <tr>
                    <td>Team 1 Players</td>
                    <td>${data.team1Players.join(' & ')}</td>
                  </tr>
                  <tr>
                    <td>Team 2 Players</td>
                    <td>${data.team2Players.join(' & ')}</td>
                  </tr>
                </table>

                <div class="message">
                  Great game everyone! Check out the updated rankings and stats! 🎯
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Match Details
                  </a>
                </div>
              </div>
              ${this.commonFooter}
            </div>
          `
        };
      }

      case 'matchRescheduled':
        return {
          subject: '📅 Match Rescheduled',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Important: Your Match Has Been Rescheduled! ⏰
                </div>

                <table>
                  <tr>
                    <th colspan="2">Updated Schedule</th>
                  </tr>
                  <tr>
                    <td>Previous Date</td>
                    <td>${new Date(data.oldDate).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>New Date</td>
                    <td class="highlight">${new Date(data.newDate).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Team 1</td>
                    <td>${data.team1Players.join(' & ')}</td>
                  </tr>
                  <tr>
                    <td>Team 2</td>
                    <td>${data.team2Players.join(' & ')}</td>
                  </tr>
                </table>

                <div class="message">
                  Please update your calendar with the new match time! 📅
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Match Details
                  </a>
                </div>
              </div>
              ${this.commonFooter}
            </div>
          `
        };

      default:
        throw new Error(`Unknown email template: ${templateName}`);
    }
  }

  // Implement the sending methods for each template...
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

  async sendMatchRescheduledEmail(match: Match, oldDate: Date, recipients: string[]) {
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
}

export const emailService = new EmailService();