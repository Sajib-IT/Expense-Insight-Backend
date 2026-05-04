import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const emailHelper = { sendEmail };
