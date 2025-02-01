// src/services/emailService.ts

export const emailService = {
  async sendTestEmail() {
    try {
      const response = await fetch('https://carrom-tracker.netlify.app/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'sripathivishalreddy@gmail.com',
          subject: 'Test Email from Carrom Tracker',
          html: `
            <div style="background-color: #1e293b; color: #f8fafc; padding: 20px; border-radius: 8px;">
              <h1 style="color: #60a5fa;">Carrom Tracker</h1>
              <p>This is a test email to verify the email service integration.</p>
              <p style="color: #94a3b8;">Sent at: ${new Date().toLocaleString()}</p>
            </div>
          `
        })
      });

      const data = await response.json();
      console.log('Email response:', data);
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
};