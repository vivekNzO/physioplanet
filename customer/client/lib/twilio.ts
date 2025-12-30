import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!; // e.g. 'whatsapp:+14155238886'

export const twilioClient = twilio(accountSid, authToken);

export async function sendWhatsAppOtp(phone: string, otp: string) {
  return twilioClient.messages.create({
    from: whatsappFrom,
    to: `whatsapp:${phone}`,
    body: `Your OTP code is: ${otp}`,
  });
}
