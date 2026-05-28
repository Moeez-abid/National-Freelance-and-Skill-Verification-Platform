const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Nexus Pro Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Nexus Pro Account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e2e9; border-radius: 12px;">
        <h2 style="color: #001736; text-transform: uppercase; letter-spacing: 1px;">Nexus Pro</h2>
        <p>Welcome to the platform! Please use the following code to verify your email address:</p>
        <div style="background: #f9f9ff; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #001736; border: 1px solid #89f5e7;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code will expire in 30 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
