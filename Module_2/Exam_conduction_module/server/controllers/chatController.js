const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.chatWithAssistant = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Groq API Key not configured" });
  }

  try {
    const messages = [
      { 
        role: "system", 
        content: `You are a helpful Skill Certification Assistant. 
        If a user asks to generate, create, or make an exam/test for a specific skill (e.g. 'generate a python test'), 
        you should check if the skill is one of: JavaScript, React, Node.js, SQL.
        If it is, encourage them and respond with a special hidden action.
        
        Respond with a JSON object:
        {
          "reply": "Your conversational response here (e.g. 'I'd be happy to generate a JavaScript test for you!').",
          "action": { "type": "GENERATE_EXAM", "skillName": "Extracted Skill Name" } 
        }` 
      },
      ...history.map(h => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let result;
    try {
      result = JSON.parse(chatCompletion.choices[0]?.message?.content);
    } catch (e) {
      result = { reply: chatCompletion.choices[0]?.message?.content };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Groq Chat Error:", error);
    res.status(500).json({ error: "Failed to connect to Groq AI" });
  }
};
