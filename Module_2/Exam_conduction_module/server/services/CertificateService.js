const prisma = require('../lib/prisma');

/**
 * Certificate Service
 * Handles the logic for issuing badges and certificates.
 */
class CertificateService {
  /**
   * Issues a certificate and badge for a successful exam attempt
   */
  static async issueCertification(userId, examId, score) {
    // 1. Create Certificate Record
    const certification = await prisma.eC_Certification.create({
      data: {
        userId,
        examId,
        issueDate: new Date(),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Valid for 2 years
      }
    });

    // 2. Create Badge Record
    const badge = await prisma.eC_Badge.create({
      data: {
        userId,
        name: `Certified Proficiency`,
        image: `https://api.dicebear.com/7.x/identicon/svg?seed=${examId}`, // Placeholder dynamic badge
        description: `Awarded for passing assessment with score ${score}`
      }
    });

    return { certification, badge };
  }
}

module.exports = CertificateService;
