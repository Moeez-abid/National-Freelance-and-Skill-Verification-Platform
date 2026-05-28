const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class GradingService {
  async evaluateAnswer(givenAnswer, correctAnswer, questionText) {
    console.log(`[GRADING] Question: "${questionText.substring(0, 50)}..."`);
    console.log(`[GRADING] Comparing: "${givenAnswer}" vs "${correctAnswer}"`);

    const cleanGiven = String(givenAnswer).trim().toLowerCase();
    const cleanCorrect = String(correctAnswer).trim().toLowerCase();

    if (cleanGiven === cleanCorrect) {
      console.log(`[GRADING] Match found: Exact`);
      return true;
    }

    try {
      const prompt = `
        You are a smart Exam Grader. 
        Question: "${questionText}"
        The correct answer is: "${correctAnswer}"
        The student chose: "${givenAnswer}"
        
        Task: Does the student's choice mean the same thing as the correct answer? 
        Often the student clicks the text of an option, but the database might store the option letter or a slightly different format.
        
        Respond ONLY with a JSON object: {"isCorrect": true} or {"isCorrect": false}
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(chatCompletion.choices[0]?.message?.content);
      console.log(`[GRADING] AI Decision: ${result.isCorrect}`);
      return result.isCorrect === true;
    } catch (error) {
      console.error("[GRADING] AI Error:", error);
      return false;
    }
  }

  async evaluateCodingAnswer(givenAnswer, correctAnswer, questionText, maxPoints) {
    console.log(`[CODING GRADING] Evaluating coding submission...`);
    try {
      const prompt = `You are a coding instructor. Grade this submission.
Problem: ${questionText}
Expected: ${correctAnswer}
Student answer: ${givenAnswer}
Give a score from 0 to ${maxPoints} and one sentence of feedback.
Respond ONLY as valid JSON: {"score": <number>, "feedback": "<string>"}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      const raw = chatCompletion.choices[0]?.message?.content || '';
      console.log(`[CODING GRADING] Raw response: ${raw}`);

      // Extract JSON from response (handles markdown code blocks too)
      const jsonMatch = raw.match(/\{[\s\S]*"score"[\s\S]*"feedback"[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const result = JSON.parse(jsonMatch[0]);
      const score = Math.min(Math.max(parseInt(result.score) || 0, 0), maxPoints);
      console.log(`[CODING GRADING] Score: ${score}/${maxPoints} — ${result.feedback}`);
      return { score, feedback: result.feedback };
    } catch (error) {
      console.error("[CODING GRADING] AI Error:", error.message);
      // Fallback: give partial credit instead of zero
      const partialScore = Math.floor(maxPoints * 0.5);
      return { score: partialScore, feedback: "Your submission was received and given partial credit." };
    }
  }


  calculatePassStatus(totalScore, passingScore) {
    return totalScore >= passingScore ? 'passed' : 'failed';
  }
}

module.exports = new GradingService();

