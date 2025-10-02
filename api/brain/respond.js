// Simple stub for Friday's brain.
// Later, replace logic here with a call to your real CustomGPT endpoint.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text, session_id, context } = req.body || {};

    // 🧠 Stub logic: respond differently based on message text
    let reply = "Okay.";
    if (text) {
      const lower = text.toLowerCase();

      if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hey there 👋, Friday here. What can I do for you?";
      } else if (lower.includes("hours")) {
        reply = "We’re open 11am to midnight every day!";
      } else if (lower.includes("menu")) {
        reply = "You can see the menu at https://mvpsportsbar.com/menu 🍔🍺";
      } else {
        reply = `I heard: "${text}". Want me to take action on that?`;
      }
    }

    // Respond in the same shape the inbound handler expects
    return res.status(200).json({ text: reply, session: session_id, context });
  } catch (err) {
    console.error("Brain stub error:", err);
    return res.status(500).json({ error: "Brain stub failed" });
  }
}
