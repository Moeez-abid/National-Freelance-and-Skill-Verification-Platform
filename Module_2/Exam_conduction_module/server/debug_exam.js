const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const examId = 16;
  const exam = await prisma.ecSkillAssessment.findUnique({
    where: { id: examId },
    include: {
      exam_questions: {
        include: { question: true }
      }
    }
  });
  console.log('Exam Data for ID 16:', JSON.stringify(exam, null, 2));
}

main().finally(() => prisma.$disconnect());
