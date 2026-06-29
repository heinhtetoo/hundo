async function sendEmail({ to, subject, html }) {
  if (process.env.NODE_ENV === 'test') return;

  if (process.env.EMAIL_PROVIDER === 'resend') {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return;
  }

  const linkMatch = html.match(/href="([^"]+)"/);
  const link = linkMatch ? linkMatch[1] : null;
  console.log(`\n[email] to=${to} | ${subject}${link ? `\n  → ${link}` : ''}\n`);
}

async function sendVerificationEmail(to, link) {
  await sendEmail({
    to,
    subject: 'Verify your Hundo account',
    html: `<p>Click the button below to verify your email address.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none">Verify my account</a></p>
<p>This link expires in 24 hours. If you did not sign up for Hundo, you can ignore this email.</p>`,
  });
}

async function sendPasswordResetEmail(to, link) {
  await sendEmail({
    to,
    subject: 'Reset your Hundo password',
    html: `<p>Click the button below to reset your password. This link expires in 1 hour.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none">Reset my password</a></p>
<p>If you did not request a password reset, you can ignore this email.</p>`,
  });
}

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
