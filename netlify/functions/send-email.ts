// netlify/functions/send-email.ts
import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, html } = JSON.parse(event.body || '{}');

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
}