import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  });
};
