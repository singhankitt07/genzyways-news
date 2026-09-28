import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, password: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log(`[PASSWORD RESET] Email: ${email}`);
    console.log(`[PASSWORD RESET] New password: ${password}`);
    return { sent: false, fallback: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass }
  });

  const from = process.env.SMTP_FROM || user;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Your GenzyWayNews password reset",
    text: `Your new password is: ${password}\n\nPlease sign in and change it from your profile page as soon as possible.`,
    html: `
      <p>Hello,</p>
      <p>Your password has been reset successfully.</p>
      <p><strong>New password:</strong> ${password}</p>
      <p>Please sign in and change it from your profile page as soon as possible.</p>
    `
  });

  return { sent: true, fallback: false };
}
