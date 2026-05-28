const prisma = require('../lib/prisma');

exports.createQuestion = async (req, res) => {
  const { text, type, options, correctAnswer, points } = req.body;
  try {
    const question = await prisma.ecQuestion.create({
      data: { 
        question_text: text, 
        question_type: type, 
        options, 
        correct_answer: correctAnswer, 
        points: parseInt(points) || 10 
      },
    });
    res.status(201).json({ ...question, text: question.question_text, type: question.question_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.addQuestionToExam = async (req, res) => {
  const { examId, questionId } = req.body;
  try {
    const examQuestion = await prisma.ecExamQuestion.upsert({
      where: { assessment_id_question_id: { assessment_id: parseInt(examId), question_id: parseInt(questionId) } },
      update: {},
      create: { assessment_id: parseInt(examId), question_id: parseInt(questionId) }
    });
    res.status(201).json(examQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to link question to exam' });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await prisma.ecQuestion.findMany();
    // Map back for frontend
    const mappedQuestions = questions.map(q => ({
      ...q,
      text: q.question_text,
      type: q.question_type
    }));
    res.status(200).json(mappedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};
