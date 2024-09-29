import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();

  try {
    const data = await resend.emails.send({
      from: `Task Manager Two <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}