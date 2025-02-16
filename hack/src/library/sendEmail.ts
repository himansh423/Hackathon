import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Event Platform Support" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
}
