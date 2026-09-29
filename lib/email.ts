import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  const subject = "Reset your GenzyWayNews password";
  const text = `Use this link to reset your GenzyWayNews password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`;
  const html = `<p>Hello,</p><p>We received a request to reset your GenzyWayNews password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: from || "GenzyWayNews <onboarding@resend.dev>", to: [email], subject, text, html })
    });
    if (!response.ok) throw new Error(`Resend rejected the email: ${response.status}`);
    return { sent: true, provider: "resend" };
  }

  if (!host || !user || !pass) {
    throw new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS or RESEND_API_KEY.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html
  });

  return { sent: true, provider: "smtp" };
}
