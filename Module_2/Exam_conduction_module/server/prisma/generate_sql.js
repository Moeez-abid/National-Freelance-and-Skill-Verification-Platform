const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'seed-data.json');
const sqlPath = path.join(__dirname, 'populate_db.sql');

const { skills, questions, exams } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let sql = `-- Database Population Script for Skill Testing Module\n\n`;

// 1. Users
sql += `-- Users\n`;
sql += `INSERT INTO "EC_User" (id, email, password, name, role, "createdAt") VALUES\n`;
sql += `('admin-id', 'admin@skillcertify.com', '$2b$10$awX4kQER.xkoPFK5MyRjReWD2GIdA7yZFa8GG0zkucKBF3FmveaYG', 'System Admin', 'ADMIN', NOW()),\n`;
sql += `('user-id', 'user@skillcertify.com', '$2b$10$awX4kQER.xkoPFK5MyRjReWD2GIdA7yZFa8GG0zkucKBF3FmveaYG', 'Test User', 'FREELANCER', NOW());\n\n`;

// 2. Skills
sql += `-- Skills\n`;
sql += `INSERT INTO "EC_Skill" (id, name) VALUES\n`;
skills.forEach((s, i) => {
    sql += `('${s.id}', '${s.name}')${i === skills.length - 1 ? ';' : ','}\n`;
});
sql += `\n`;

// 3. Questions
sql += `-- Questions\n`;
sql += `INSERT INTO "EC_Question" (id, text, type, "skillId", options, "correctAnswer", points) VALUES\n`;
questions.forEach((q, i) => {
    const options = q.options ? `'${JSON.stringify(q.options)}'::json` : 'NULL';
    sql += `('${q.id}', '${q.text.replace(/'/g, "''")}', '${q.type}', '${q.skillId}', ${options}, '${q.correctAnswer.replace(/'/g, "''")}', ${q.points})${i === questions.length - 1 ? ';' : ','}\n`;
});
sql += `\n`;

// 4. Exams
sql += `-- Exams\n`;
sql += `INSERT INTO "EC_Exam" (id, title, description, "skillId", duration, "passingScore") VALUES\n`;
exams.forEach((e, i) => {
    sql += `('${e.id}', '${e.title.replace(/'/g, "''")}', '${(e.description || '').replace(/'/g, "''")}', '${e.skillId}', ${e.duration}, ${e.passingScore})${i === exams.length - 1 ? ';' : ','}\n`;
});
sql += `\n`;

// 5. Exam Questions
sql += `-- Exam Questions\n`;
sql += `INSERT INTO "EC_ExamQuestion" ("examId", "questionId") VALUES\n`;
const examLinks = [];
exams.forEach(e => {
    e.questions.forEach(q => {
        examLinks.push(`('${e.id}', '${q.questionId}')`);
    });
});
sql += examLinks.join(',\n') + ';\n';

fs.writeFileSync(sqlPath, sql);
console.log('✅ populate_db.sql generated successfully.');
