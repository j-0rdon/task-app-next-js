import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const data = await resend.emails.send({
      from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_SENDER_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};