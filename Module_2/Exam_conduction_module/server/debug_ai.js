const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  console.log('Testing Groq AI connection...');
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello, how are you?" }],
      model: "llama-3.3-70b-versatile",
    });
    console.log('AI Reply:', chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Groq AI Error:', error.message);
  }
}

main();
