import { sendEmail } from './mailer';

export async function sendTaskNotification(userEmail: string, taskTitle: string) {
  const subject = 'New Task Created';
  const text = `You have created a new task: ${taskTitle}`;
  
  try {
    await sendEmail(userEmail, subject, text);
    console.log('Task notification email sent successfully');
  } catch (error) {
    console.error('Error sending task notification email:', error);
    // Here you might want to implement some kind of retry logic,
    // or notify the user that the email couldn't be sent
    throw new Error('Failed to send task notification email');
  }
}