// api/sms/inbound.js  (Vercel serverless - Node)
const { twiml } = require("twilio");

async function brainReply(text, from) {
  const r = await fetch(process.env.CUSTOMGPT_URL || `${process.env.PUBLIC_BASE_URL}/api/brain/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Friday-Auto": "v4"
    },
    body: JSON.stringify({
      session_id: `sms:${from}`,
      role: "user",
      text,
      context: { channel: "sms", from }
    })
  });
  const data = await r.json().catch(() => ({}));
  return data.text || "Got it.";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const from = req.body?.From || "";
  const body = (req.body?.Body || "").trim();
  const B = body.toUpperCase();
  const msg = new (twiml.MessagingResponse)();

  // CTIA compliance keywords
  if (["STOP","STOPALL","UNSUBSCRIBE","CANCEL","END","QUIT"].includes(B)) {
    msg.message("You’re opted out. Reply START to opt back in. – Friday");
    res.setHeader("Content-Type","text/xml"); return res.status(200).send(msg.toString());
  }
  if (["START","YES","UNSTOP"].includes(B)) {
    msg.message("You’re opted in again. How can I help? – Friday");
    res.setHeader("Content-Type","text/xml"); return res.status(200).send(msg.toString());
  }
  if (B === "HELP") {
    msg.message("Friday (MVP’s). Msg&data rates may apply. Reply STOP to cancel.");
    res.setHeader("Content-Type","text/xml"); return res.status(200).send(msg.toString());
  }

  // (Optional) escalation: say "CALL ME" to trigger voice later
  if (/\bCALL ME\b/i.test(body)) {
    msg.message("Got it—calling you now.");
    // fire-and-forget; implement /api/call/start in voice phase
    fetch(`${process.env.PUBLIC_BASE_URL}/api/call/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: from })
    }).catch(()=>{});
    res.setHeader("Content-Type","text/xml"); return res.status(200).send(msg.toString());
  }

  // Send to Friday's brain
  let reply = "Okay.";
  try { reply = await brainReply(body, from); } catch {}
  msg.message(reply);

  res.setHeader("Content-Type","text/xml");
  return res.status(200).send(msg.toString());
};
