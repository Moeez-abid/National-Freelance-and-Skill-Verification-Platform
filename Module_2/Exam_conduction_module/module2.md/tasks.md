1.2.2 Module 2 Scope
Module 2 handles freelancer skill assessments and certifications. When users register a
skill, they can take a structured test. Passing issues a digital badge and certificate used
across the platform as a trust signal.
The module specifically covers:
• Online skill assessments, including multiple choice questions (MCQs), coding challenges, and practical task submissions
• Automated grading of objective test types
• Digital badge and certificate generation and storage
• Test attempt history tracking per user

• Assessment Engine: Selects questions from the question bank based on the skill,
difficulty tier, and attempt history. Manages test session timing.
• Grading Service: Evaluates MCQ responses by comparison and code submissions
by running them through an online judge. Produces a normalised percentage score.
• Badge & Certificate Service: Issues digital badges and generates PDF certificates when a freelancer passes. Handles revocation when a badge is superseded.
• History Service: Records every test attempt with its answers, score, and status.


4. Data Design
4.1 Data Description
Module 2 persists five main data categories:
Question Bank: Stores MCQ, coding, or practical questions, including correct answers
and test cases.
Skill Tests: Configuration mapping questions to a skill, specifying time limits, pass
thresholds, and attempt limits.
Test Attempts: Immutable records storing submitted answers, scores, outcomes, and
timestamps for audit history.
Badges and Certificates: Credentials issued upon passing, linked to users and attempts. PDF files are referenced by path.
Skill Categories: Master reference table ensuring consistent skill identifiers across all
integrated platform modules