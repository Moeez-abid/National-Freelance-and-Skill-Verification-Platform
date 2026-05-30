'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'jest-results.json');
const outputPath = path.join(root, 'jest-report-final.html');

const results = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const suites = results.testResults || [];
const passed = results.numPassedTests || 0;
const failed = results.numFailedTests || 0;
const total = results.numTotalTests || 0;
const passRate = total === 0 ? 0 : Math.round((passed / total) * 100);
const generatedAt = new Date().toLocaleString();

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const suiteRows = suites.map((suite) => {
  const assertions = suite.assertionResults || [];
  const suitePassed = assertions.filter((test) => test.status === 'passed').length;
  const suiteFailed = assertions.filter((test) => test.status === 'failed').length;
  const status = suiteFailed > 0 ? 'Failed' : 'Passed';
  const name = path.relative(root, suite.name);

  return `
    <tr>
      <td>${esc(name)}</td>
      <td><span class="badge ${status.toLowerCase()}">${status}</span></td>
      <td>${suitePassed}</td>
      <td>${suiteFailed}</td>
      <td>${Math.round((suite.perfStats?.runtime || 0))} ms</td>
    </tr>`;
}).join('');

const failedTests = suites.flatMap((suite) =>
  (suite.assertionResults || [])
    .filter((test) => test.status === 'failed')
    .map((test) => ({
      suite: path.relative(root, suite.name),
      title: test.fullName,
      message: (test.failureMessages || []).join('\n\n'),
    }))
);

const failuresHtml = failedTests.length === 0
  ? '<p class="muted">No failing tests.</p>'
  : failedTests.map((test) => `
      <article class="failure">
        <h3>${esc(test.title)}</h3>
        <p>${esc(test.suite)}</p>
        <pre>${esc(test.message)}</pre>
      </article>
    `).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NFASVP Module 3 - Jest Test Report</title>
  <style>
    body { margin: 0; font-family: Inter, Segoe UI, Arial, sans-serif; background: #f6f7fb; color: #172033; }
    main { max-width: 1080px; margin: 0 auto; padding: 40px 24px; }
    h1 { margin: 0; font-size: 32px; }
    h2 { margin-top: 32px; }
    .muted { color: #667085; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
    .card { background: #fff; border: 1px solid #e3e8f0; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }
    .value { font-size: 30px; font-weight: 800; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e3e8f0; border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 13px 16px; border-bottom: 1px solid #edf1f7; font-size: 14px; }
    th { background: #f0f3f9; color: #475467; text-transform: uppercase; font-size: 12px; letter-spacing: .04em; }
    .badge { display: inline-block; border-radius: 999px; padding: 4px 10px; font-weight: 700; font-size: 12px; }
    .passed { background: #dcfce7; color: #166534; }
    .failed { background: #fee2e2; color: #991b1b; }
    .failure { background: #fff; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    pre { white-space: pre-wrap; overflow: auto; background: #111827; color: #f9fafb; padding: 16px; border-radius: 6px; }
  </style>
</head>
<body>
  <main>
    <h1>NFASVP Module 3 - Jest Test Report</h1>
    <p class="muted">Generated ${esc(generatedAt)}</p>

    <section class="grid">
      <div class="card"><span class="muted">Pass Rate</span><div class="value">${passRate}%</div></div>
      <div class="card"><span class="muted">Passed</span><div class="value">${passed}</div></div>
      <div class="card"><span class="muted">Failed</span><div class="value">${failed}</div></div>
      <div class="card"><span class="muted">Total Tests</span><div class="value">${total}</div></div>
    </section>

    <h2>Suites</h2>
    <table>
      <thead><tr><th>Suite</th><th>Status</th><th>Passed</th><th>Failed</th><th>Runtime</th></tr></thead>
      <tbody>${suiteRows}</tbody>
    </table>

    <h2>Failures</h2>
    ${failuresHtml}
  </main>
</body>
</html>`;

fs.writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);
