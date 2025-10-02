import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { to, body } = req.body || {};
  if (!to || !body) {
    return res.status(400).json({ error: "Missing 'to' or 'body'" });
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      to,
      body,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return res.status(200).json({ sid: message.sid, status: message.status });
  } catch (err) {
    console.error("Twilio send error:", err);
    return res.status(500).json({ error: "Failed to send SMS" });
  }
}
