const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Centralized Database Seeding...');

  const dataPath = path.join(__dirname, 'seed-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ seed-data.json not found!');
    return;
  }

  const { skills, questions, exams } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Clear existing data in correct order
  console.log('🧹 Cleaning database...');
  await prisma.ecBadge.deleteMany();
  await prisma.ecCertificate.deleteMany();
  await prisma.ecSubmission.deleteMany();
  await prisma.ecTestAttempt.deleteMany();
  await prisma.ecExamQuestion.deleteMany();
  await prisma.ecQuestion.deleteMany();
  await prisma.ecSkillAssessment.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Default Accounts
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  console.log('👤 Seeding users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillcertify.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Admin',
      role: 'admin'
    }
  });

  const freelancer = await prisma.user.create({
    data: {
      email: 'user@skillcertify.com',
      password_hash: userPassword,
      first_name: 'Test',
      last_name: 'User',
      role: 'freelancer'
    }
  });

  // 3. Seed Skills and keep map of UUID -> Int ID
  console.log('✅ Seeding skills...');
  const skillMap = {};
  for (const s of skills) {
    const createdSkill = await prisma.skill.create({
      data: {
        skill_name: s.name,
        category: s.category || 'General'
      }
    });
    skillMap[s.id] = createdSkill.id;
  }

  // 4. Seed Questions (First, so we can link them later)
  console.log('✅ Seeding questions...');
  const questionMap = {};
  for (const q of questions) {
    const createdQuestion = await prisma.ecQuestion.create({
      data: {
        question_text: q.text,
        question_type: q.type,
        options: q.options,
        correct_answer: q.correctAnswer,
        points: q.points || 1
      }
    });
    questionMap[q.id] = createdQuestion.id;
  }

  // 5. Seed Assessments (Exams) and Links
  console.log('✅ Seeding assessments and links...');
  for (const e of exams) {
    const createdAssessment = await prisma.ecSkillAssessment.create({
      data: {
        assessment_name: e.title,
        description: e.description,
        skill_id: skillMap[e.skillId],
        duration: e.duration || 30,
        passing_score: e.passingScore || 50
      }
    });

    // Create links in ec_exam_questions
    for (const qRef of e.questions) {
      const qId = questionMap[qRef.questionId];
      if (qId) {
        await prisma.ecExamQuestion.create({
          data: {
            assessment_id: createdAssessment.id,
            question_id: qId
          }
        });
      }
    }
  }

  console.log('🏆 Database synchronized with Centralized Schema!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
