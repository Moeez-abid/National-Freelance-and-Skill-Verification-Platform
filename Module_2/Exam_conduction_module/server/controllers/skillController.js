const prisma = require('../lib/prisma');

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    // Map skill_name to name for frontend compatibility if needed
    const mappedSkills = skills.map(s => ({ ...s, name: s.skill_name }));
    res.status(200).json(mappedSkills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

exports.createSkill = async (req, res) => {
  const { name } = req.body;
  try {
    const skill = await prisma.skill.create({ data: { skill_name: name } });
    res.status(201).json({ ...skill, name: skill.skill_name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

exports.getSkillById = async (req, res) => {
  const { id } = req.params;
  try {
    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    res.status(200).json({ ...skill, name: skill.skill_name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
};
