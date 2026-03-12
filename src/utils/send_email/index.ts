import { MailOptions } from "../../types";
import { transporter } from "../node_mailer";

async function sendEmail(
  mail: MailOptions,
  max_tries: number,
  back_off: number
): Promise<{ success: boolean; attempts: number; error?: string; info?: any }> {
  let attempts = 0;
  let last_error: any = null;

  while (attempts < max_tries) {
    attempts++;
    try {
      const info = await transporter.sendMail(mail);
      console.log(`Email sent: ${info.messageId} to ${mail.to}`);
      return { success: true, attempts, info };
    } catch (error: any) {
      last_error = error;
      const transient =
        /rate|timeout|connection|throttle|ETIMEDOUT|ECONNRESET/i.test(
          String(error?.message || "")
        );
      console.log(`Error sending email to ${mail.to}:`, error.message || error);
      if (!transient || attempts >= max_tries) break;
      const backoff = back_off * Math.pow(2, attempts - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  return { success: false, attempts, error: last_error };
}

export { sendEmail };
