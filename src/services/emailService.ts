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
    /* Light mode styles */
    :root {
      --background: #ffffff;
      --card: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --primary: #4f46e5;
      --primary-light: #6366f1;
      --border: #e2e8f0;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }

    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      :root {
        --background: #0f172a;
        --card: #1e293b;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --primary: #818cf8;
        --primary-light: #a5b4fc;
        --border: #334155;
        --success: #4ade80;
        --warning: #fbbf24;
        --danger: #f87171;
      }
    }

    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--background);
      color: var(--text-primary);
    }

    .container {
      max-width: 600px;
      margin: 24px auto;
      border-radius: 12px;
      overflow: hidden;
      background-color: var(--card);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .header {
      background-color: var(--primary);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .content {
      padding: 24px;
      color: var(--text-primary);
    }

    .card {
      background-color: var(--background);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .button {
      display: inline-block;
      background-color: var(--primary);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 16px 0;
      text-align: center;
      transition: background-color 0.2s;
    }

    .button:hover {
      background-color: var(--primary-light);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 16px 0;
    }

    .stat-card {
      background-color: var(--background);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary);
      margin: 8px 0;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .badge-success {
      background-color: var(--success);
      color: #ffffff;
    }

    .badge-warning {
      background-color: var(--warning);
      color: #ffffff;
    }

    .divider {
      height: 1px;
      background-color: var(--border);
      margin: 24px 0;
    }

    .footer {
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      border-top: 1px solid var(--border);
    }

    .footer a {
      color: var(--primary);
      text-decoration: none;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--primary);
      color: #ffffff;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .team-score {
      font-size: 32px;
      font-weight: bold;
      color: var(--primary);
      text-align: center;
      margin: 16px 0;
    }

    .winner-badge {
      background-color: var(--success);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 9999px;
      font-weight: 500;
      text-align: center;
      margin: 16px auto;
      display: inline-block;
    }

    .player-name {
      font-weight: 500;
      color: var(--text-primary);
    }
  `;

  private getEmailTemplate(templateName: string, data: any): EmailTemplate {
    const commonFooter = `
      <div class="footer">
        <p>
          Questions or concerns? Contact us at 
          <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a>
        </p>
        <p>© ${new Date().getFullYear()} Carrom Tracker. All rights reserved.</p>
        <p>
          <a href="${this.APP_URL}/settings/notifications">Email Preferences</a> •
          <a href="${this.APP_URL}/privacy">Privacy Policy</a> •
          <a href="${this.APP_URL}/terms">Terms of Service</a>
        </p>
      </div>
    `;

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
              ${commonFooter}
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
                <h2 style="text-align: center;">New Match Scheduled! 🎯</h2>
                
                <div class="card">
                  <div style="text-align: center;">
                    <div class="badge badge-success" style="margin-bottom: 16px;">
                      ${new Date(data.date).toLocaleDateString()} at ${new Date(data.date).toLocaleTimeString()}
                    </div>
                  </div>

                  <div class="stats">
                    <div class="stat-card">
                      <h3>Team 1</h3>
                      ${data.team1Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                    <div class="stat-card">
                      <h3>Team 2</h3>
                      ${data.team2Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Match Details
                  </a>
                </div>

                <div class="card" style="margin-top: 24px;">
                  <h3>Match Details</h3>
                  <ul style="padding-left: 20px;">
                    <li>Arrive 10 minutes before the match</li>
                    <li>Bring your own striker if preferred</li>
                    <li>Match duration: ~30 minutes</li>
                    <li>First to 29 points wins</li>
                  </ul>
                </div>
              </div>
              ${commonFooter}
            </div>
          `
        };

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
                <h2 style="text-align: center;">Match Rescheduled ⏰</h2>
                
                <div class="card">
                  <div class="stats">
                    <div class="stat-card">
                      <h3>Previous Date</h3>
                      <p class="badge badge-warning">
                        ${new Date(data.oldDate).toLocaleDateString()} at ${new Date(data.oldDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div class="stat-card">
                      <h3>New Date</h3>
                      <p class="badge badge-success">
                        ${new Date(data.newDate).toLocaleDateString()} at ${new Date(data.newDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div class="divider"></div>

                  <div class="stats">
                    <div class="stat-card">
                      <h3>Team 1</h3>
                      ${data.team1Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                    <div class="stat-card">
                      <h3>Team 2</h3>
                      ${data.team2Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Updated Match Details
                  </a>
                </div>
              </div>
              ${commonFooter}
            </div>
          `
        };

      case 'matchCompleted': {
        const winningTeam = data.winner === 'team1' ? 1 : 2;
        const winningScore = data.winner === 'team1' ? data.team1Score : data.team2Score;
        const losingScore = data.winner === 'team1' ? data.team2Score : data.team1Score;

        return {
          subject: `🏆 Match Results - Team ${winningTeam} Wins!`,
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <h2 style="text-align: center;">Match Results 🏆</h2>
                
                <div class="card">
                  <div class="winner-badge">
                    Team ${winningTeam} Wins! 🎉
                  </div>

                  <div class="team-score">
                    ${data.team1Score} - ${data.team2Score}
                  </div>

                  <div class="stats">
                    <div class="stat-card">
                      <h3>Team 1</h3>
                      ${data.team1Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                      <div class="stat-value">${data.team1Score}</div>
                      <div class="stat-label">Points Scored</div>
                    </div>
                    <div class="stat-card">
                      <h3>Team 2</h3>
                      ${data.team2Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                      <div class="stat-value">${data.team2Score}</div>
                      <div class="stat-label">Points Scored</div>
                    </div>
                  </div>

                  <div class="divider"></div>

                  <div class="card" style="margin-top: 24px;">
                    <h3>Match Highlights</h3>
                    <div class="stats">
                      <div class="stat-card">
                        <div class="stat-value">${winningScore}</div>
                        <div class="stat-label">Winning Score</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-value">${losingScore}</div>
                        <div class="stat-label">Losing Score</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-value">${Math.abs(data.team1Score - data.team2Score)}</div>
                        <div class="stat-label">Point Difference</div>
                      </div>
                    </div>
                  </div>

                  <div style="text-align: center; margin-top: 24px;">
                    <a href="${this.APP_URL}/matches" class="button">
                      View Match Details
                    </a>
                  </div>
                </div>
              </div>
              ${commonFooter}
            </div>
          `
        };
      }

      case 'matchReminder':
        return {
          subject: '⏰ Match Reminder - Starting Soon!',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <h2 style="text-align: center;">Your Match Starts Soon! ⏰</h2>
                
                <div class="card">
                  <div style="text-align: center;">
                    <div class="badge badge-warning" style="margin-bottom: 16px;">
                      Starting in 30 minutes
                    </div>
                    <p style="font-size: 18px; margin: 16px 0;">
                      ${new Date(data.date).toLocaleDateString()} at ${new Date(data.date).toLocaleTimeString()}
                    </p>
                  </div>

                  <div class="stats">
                    <div class="stat-card">
                      <h3>Team 1</h3>
                      ${data.team1Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                    <div class="stat-card">
                      <h3>Team 2</h3>
                      ${data.team2Players.map(player => `
                        <p class="player-name">${player}</p>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="card" style="margin-top: 24px;">
                  <h3>Quick Reminders</h3>
                  <ul style="padding-left: 20px;">
                    <li>Arrive 10 minutes early for warm-up</li>
                    <li>Bring your striker (if preferred)</li>
                    <li>Check your equipment</li>
                    <li>Stay hydrated!</li>
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/matches" class="button">
                    View Match Details
                  </a>
                </div>
              </div>
              ${commonFooter}
            </div>
          `
        };

      case 'achievementUnlocked':
        return {
          subject: '🎉 New Achievement Unlocked!',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <h2 style="text-align: center;">Achievement Unlocked! 🏆</h2>
                
                <div class="card" style="text-align: center;">
                  <div class="avatar" style="font-size: 32px;">🏆</div>
                  <h3>${data.achievementName}</h3>
                  <p>${data.description}</p>
                  
                  <div class="badge badge-success" style="margin: 16px 0;">
                    +${data.points} Points
                  </div>
                </div>

                <div class="card" style="margin-top: 24px;">
                  <div class="stats">
                    <div class="stat-card">
                      <div class="stat-value">${data.totalAchievements}</div>
                      <div class="stat-label">Total Achievements</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${data.ranking}</div>
                      <div class="stat-label">Current Ranking</div>
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/profile/achievements" class="button">
                    View All Achievements
                  </a>
                </div>
              </div>
              ${commonFooter}
            </div>
          `
        };

      case 'weeklyStats':
        return {
          subject: '📊 Your Weekly Carrom Stats',
          html: `
            <style>${this.baseStyles}</style>
            <div class="container">
              <div class="header">
                <h1 class="logo">🎯 Carrom Tracker</h1>
              </div>
              <div class="content">
                <h2 style="text-align: center;">Weekly Performance Report 📊</h2>
                
                <div class="card">
                  <div class="stats">
                    <div class="stat-card">
                      <div class="stat-value">${data.matchesPlayed}</div>
                      <div class="stat-label">Matches Played</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${data.winRate}%</div>
                      <div class="stat-label">Win Rate</div>
                    </div>
                  </div>

                  <div class="divider"></div>

                  <div class="stats">
                    <div class="stat-card">
                      <div class="stat-value">${data.avgScore}</div>
                      <div class="stat-label">Average Score</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${data.highestScore}</div>
                      <div class="stat-label">Highest Score</div>
                    </div>
                  </div>
                </div>

                <div class="card" style="margin-top: 24px;">
                  <h3>Performance Insights</h3>
                  <ul style="padding-left: 20px;">
                    ${data.insights.map(insight => `
                      <li>${insight}</li>
                    `).join('')}
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${this.APP_URL}/stats" class="button">
                    View Detailed Stats
                  </a>
                </div>
              </div>
              ${commonFooter}
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

  async sendMatchReminderEmail(match: Match, recipients: string[]) {
    const template = this.getEmailTemplate('matchReminder', {
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

  async sendAchievementEmail(achievement: any, recipient: string) {
    const template = this.getEmailTemplate('achievementUnlocked', achievement);
    return this.sendEmail({
      to: recipient,
      ...template
    });
  }

  async sendWeeklyStatsEmail(stats: any, recipient: string) {
    const template = this.getEmailTemplate('weeklyStats', stats);
    return this.sendEmail({
      to: recipient,
      ...template
    });
  }
}

export const emailService = new EmailService();