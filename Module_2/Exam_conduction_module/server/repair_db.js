const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repairLinks() {
  console.log('Starting Database Repair: Linking Questions to Exams...');
  
  const exams = await prisma.eC_Exam.findMany();
  
  for (const exam of exams) {
    // Find all questions belonging to the same skill
    const questions = await prisma.eC_Question.findMany({
      where: { skillId: exam.skillId }
    });
    
    console.log(`Exam: ${exam.title} - Found ${questions.length} matching questions.`);
    
    for (const question of questions) {
      await prisma.eC_ExamQuestion.upsert({
        where: {
          examId_questionId: {
            examId: exam.id,
            questionId: question.id
          }
        },
        update: {},
        create: {
          examId: exam.id,
          questionId: question.id
        }
      });
    }
  }
  
  console.log('Repair Complete! All exams should now have their questions linked.');
}

repairLinks()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
