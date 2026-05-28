const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportData() {
  console.log("🚀 Starting Database Export...");
  
  const skills = await prisma.eC_Skill.findMany();
  const exams = await prisma.eC_Exam.findMany({
    include: { questions: { include: { question: true } } }
  });
  const questions = await prisma.eC_Question.findMany();

  const data = {
    skills,
    questions,
    exams: exams.map(e => ({
      ...e,
      questionIds: e.questions.map(q => q.questionId)
    }))
  };

  fs.writeFileSync('./prisma/seed-data.json', JSON.stringify(data, null, 2));
  console.log("✅ Data exported successfully to ./prisma/seed-data.json");
}

exportData()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
