const prisma = require('../lib/prisma');

exports.getAllExams = async (req, res) => {
  try {
    const exams = await prisma.ecSkillAssessment.findMany({
      include: { 
        skill: true,
        exam_questions: {
          include: { question: true }
        }
      }
    });
    // Map assessment_name to title for frontend compatibility
    const mappedExams = exams.map(e => {
      const totalPoints = e.exam_questions.reduce((sum, eq) => sum + (eq.question.points || 0), 0);
      return { 
        ...e, 
        title: e.assessment_name,
        passingScore: e.passing_score,
        totalPoints: totalPoints,
        questions: e.exam_questions.map(eq => ({
          ...eq,
          question: {
            ...eq.question,
            text: eq.question.question_text,
            type: eq.question.question_type
          }
        })),
        skill: e.skill ? { ...e.skill, name: e.skill.skill_name } : null
      };
    });
    res.status(200).json(mappedExams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

exports.getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.ecSkillAssessment.findUnique({
      where: { id: parseInt(id) },
      include: {
        skill: true,
        exam_questions: {
          include: { question: true }
        }
      }
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    
    const totalPoints = exam.exam_questions.reduce((sum, eq) => sum + (eq.question.points || 0), 0);
    res.status(200).json({ 
      ...exam, 
      title: exam.assessment_name,
      passingScore: exam.passing_score,
      totalPoints: totalPoints,
      questions: exam.exam_questions.map(eq => ({
        ...eq,
        question: {
          ...eq.question,
          text: eq.question.question_text,
          type: eq.question.question_type
        }
      })),
      skill: exam.skill ? { ...exam.skill, name: exam.skill.skill_name } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exam details' });
  }
};

exports.createExam = async (req, res) => {
  const { title, description, skillId, duration, passingScore } = req.body;
  try {
    const exam = await prisma.ecSkillAssessment.create({
      data: { 
        assessment_name: title, 
        description, 
        skill_id: parseInt(skillId), 
        duration: parseInt(duration), 
        passing_score: parseInt(passingScore) 
      }
    });
    res.status(201).json({ ...exam, title: exam.assessment_name, passingScore: exam.passing_score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};
