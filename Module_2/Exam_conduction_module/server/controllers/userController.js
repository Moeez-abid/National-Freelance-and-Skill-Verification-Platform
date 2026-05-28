const prisma = require('../lib/prisma');

exports.getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        test_attempts: {
          include: { assessment: { include: { skill: true } } },
          orderBy: { started_at: 'desc' }
        },
        certificates: { include: { assessment: true } },
        badges: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Map fields back to the names the frontend expects (CamelCase)
    const mappedAttempts = user.test_attempts.map(attempt => ({
      ...attempt,
      attemptDate: attempt.started_at,
      exam: {
        ...attempt.assessment,
        title: attempt.assessment.assessment_name,
        skill: attempt.assessment.skill
      }
    }));

    const mappedCertifications = user.certificates.map(cert => ({
      ...cert,
      issueDate: cert.issue_date,
      exam: {
        ...cert.assessment,
        title: cert.assessment.assessment_name
      }
    }));

    const stats = {
      totalAttempts: user.test_attempts.length,
      passedAttempts: user.test_attempts.filter(a => a.status === 'passed').length,
      certificationCount: user.certificates.length,
      badgeCount: user.badges.length
    };

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ 
      ...userWithoutPassword, 
      name: `${user.first_name} ${user.last_name}`.trim(),
      testAttempts: mappedAttempts,
      certifications: mappedCertifications,
      badges: user.badges,
      stats 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
