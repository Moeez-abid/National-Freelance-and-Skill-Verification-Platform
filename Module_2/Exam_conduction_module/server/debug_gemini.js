const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  console.log('Testing Gemini Pro connection...');
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello, how are you?");
    const response = await result.response;
    console.log('AI Reply:', response.text());
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
  }
}

main();
