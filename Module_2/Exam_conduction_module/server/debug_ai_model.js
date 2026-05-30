const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  console.log('Testing Groq Llama3-8b connection...');
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello" }],
      model: "llama3-8b-8192",
    });
    console.log('AI Reply:', chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Groq AI Error:', error.message);
  }
}

main();
