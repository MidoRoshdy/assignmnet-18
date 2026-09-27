import nodemailer from "nodemailer";
import { env } from "../../config/env.service";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.email,
    pass: env.emailPass,
  },
});

export const sendEmail = async ({ to, subject, html }: Mail.Options) => {
  const info = await transporter.sendMail({
    from: `social media app <${env.email}>`,
    to,
    subject,
    html,
  });
  console.log("Email sent: ", info.messageId);
  return info;
};
