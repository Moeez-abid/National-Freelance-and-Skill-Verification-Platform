const { test, expect } = require('@playwright/test');
const crypto = require('node:crypto');

const API_BASE = 'http://localhost:4003/api/v1';
const JWT_SECRET = 'nfasvp-module3-dev-secret-2025';

const USERS = {
  client1: { id: 'c1000000-0000-0000-0000-000000000001', role: 'client', name: 'Client 1', email: 'client1@gigmarket.local' },
  client3: { id: 'c1000000-0000-0000-0000-000000000003', role: 'client', name: 'Client 3', email: 'client3@gigmarket.local' },
  freelancer2: { id: 'f1000000-0000-0000-0000-000000000002', role: 'freelancer', name: 'Freelancer 2', email: 'freelancer2@gigmarket.local' },
  freelancer4: { id: 'f1000000-0000-0000-0000-000000000004', role: 'freelancer', name: 'Freelancer 4', email: 'freelancer4@gigmarket.local' },
};

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function devToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    id: user.id,
    uuid: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + 60 * 60,
  };
  const unsigned = `${base64Url(header)}.${base64Url(payload)}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

async function apiJson(request, method, path, { user, data } = {}) {
  const response = await request[method](`${API_BASE}${path}`, {
    headers: user ? { Authorization: `Bearer ${devToken(user)}` } : undefined,
    data,
  });
  const json = await response.json();
  expect(response.ok(), `${method.toUpperCase()} ${path}: ${JSON.stringify(json)}`).toBeTruthy();
  expect(json.success).toBeTruthy();
  return json.data;
}

async function getWebCategoryId(request) {
  const categories = await apiJson(request, 'get', '/categories');
  return (categories || []).find((category) => /web/i.test(category.name))?.id || categories[0]?.id;
}

async function chooseUser(page, name) {
  await page.goto('/');
  await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
  await expect(page.getByText(new RegExp(`Welcome, ${name}`, 'i'))).toBeVisible();
}

test.describe('NFASVP Module 3 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      sessionStorage.clear();
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('m3_read_notifications_')) localStorage.removeItem(key);
      }
    }).catch(() => {});
  });

  test('client dashboard changes by selected seeded user', async ({ page }) => {
    await chooseUser(page, 'Client 1');
    await expect(page.getByText('c1000000-0000-0000-0000-000000000001')).toBeVisible();
    await expect(page.getByText(/Posted Jobs \/ Bids/i)).toBeVisible();

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Client 2');
    await expect(page.getByText('c1000000-0000-0000-0000-000000000002')).toBeVisible();
  });

  test('gig marketplace search returns relevant services', async ({ page }) => {
    await chooseUser(page, 'Client 1');
    await page.getByRole('button', { name: /Marketplace/i }).first().click();

    await page.getByPlaceholder(/Search services/i).fill('React');
    await expect(page.getByText(/results/i)).toBeVisible();
    await expect(page.getByText(/React/i).first()).toBeVisible();
  });

  test('freelancer can create gig in UI and client can find it in marketplace', async ({ page }) => {
    const stamp = Date.now();
    const gigTitle = `UI Created Gig ${stamp}`;

    await chooseUser(page, 'Freelancer 4');
    await page.getByRole('button', { name: /Create Gig|List New Service/i }).first().click();

    await page.getByPlaceholder(/I will design|React website/i).fill(gigTitle);
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByPlaceholder(/React, Figma/i).fill('Playwright, React');
    await page.getByPlaceholder(/Describe what you offer/i).fill('Frontend-created gig used to verify marketplace visibility from another account.');

    const numbers = page.locator('input[type="number"]');
    await numbers.nth(0).fill('150');
    await numbers.nth(1).fill('3');
    await numbers.nth(2).fill('300');
    await numbers.nth(3).fill('5');
    await numbers.nth(4).fill('600');
    await numbers.nth(5).fill('8');

    page.once('dialog', async (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Publish Gig/i }).click();
    await expect(page.getByRole('heading', { name: /My Gigs/i })).toBeVisible();
    await expect(page.getByText(gigTitle).first()).toBeVisible();

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Client 1');
    await page.getByRole('button', { name: /Marketplace/i }).first().click();
    await page.getByPlaceholder(/Search services/i).fill(gigTitle);
    await expect(page.getByText(gigTitle).first()).toBeVisible();
  });

  test('client can open a gig detail page from the marketplace', async ({ page, request }) => {
    const stamp = Date.now();
    const categoryId = await getWebCategoryId(request);
    const gigTitle = `View Detail Gig ${stamp}`;

    await apiJson(request, 'post', '/gigs', {
      user: USERS.freelancer4,
      data: {
        title: gigTitle,
        description: 'Detail page E2E gig with real required skill objects and pricing tiers.',
        category_id: categoryId,
        required_skills: ['React', 'Detail View'],
        status: 'live',
        pricing_tiers: [
          { tier: 'basic', package_name: 'Starter', description: 'Basic detail package', price: 175, delivery_days: 3 },
          { tier: 'standard', package_name: 'Growth', description: 'Standard detail package', price: 350, delivery_days: 5 },
          { tier: 'premium', package_name: 'Scale', description: 'Premium detail package', price: 700, delivery_days: 8 },
        ],
      },
    });

    await chooseUser(page, 'Client 1');
    await page.getByRole('button', { name: /Marketplace/i }).first().click();
    await page.getByPlaceholder(/Search services/i).fill(gigTitle);
    await page.getByText(gigTitle).first().click();

    await expect(page.getByRole('heading', { name: gigTitle })).toBeVisible();
    await expect(page.getByText(/Service Mandate/i)).toBeVisible();
    await expect(page.getByText(/React/i).first()).toBeVisible();
    await expect(page.getByText(/PKR 175/i)).toBeVisible();
  });

  test('freelancer project search filters visible projects', async ({ page }) => {
    await chooseUser(page, 'Freelancer 2');
    await page.getByRole('button', { name: /Active Projects/i }).first().click();

    await expect(page.getByText(/In Progress|Finalized|Awaiting Start/i).first()).toBeVisible();
    await page.getByPlaceholder(/Search your projects/i).fill('active');
    await expect(page.getByText(/In Progress/i).first()).toBeVisible();

    await page.getByPlaceholder(/Search your projects/i).fill('no-such-project-xyz');
    await expect(page.getByText(/No Matching Projects/i)).toBeVisible();
  });

  test('client can create job in UI and freelancer can find it in open jobs', async ({ page }) => {
    const stamp = Date.now();
    const jobTitle = `UI Created Job ${stamp}`;

    await chooseUser(page, 'Client 2');
    await page.getByRole('button', { name: /Post a Job|Create Project/i }).first().click();

    await page.getByPlaceholder(/Build a React Dashboard/i).fill(jobTitle);
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('input[type="number"]').nth(0).fill('400');
    await page.locator('input[type="number"]').nth(1).fill('1000');
    await page.getByPlaceholder(/Describe your project/i).fill('Frontend-created job used to verify cross-user opportunity discovery.');
    await page.getByRole('button', { name: /Publish Job/i }).click();

    await expect(page.getByRole('heading', { name: /My Jobs/i })).toBeVisible();
    await expect(page.getByText(jobTitle).first()).toBeVisible();

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Freelancer 4');
    await page.getByRole('button', { name: /Find Work/i }).click();
    await page.getByPlaceholder(/React Developer|UI Designer/i).fill(jobTitle);
    await expect(page.getByText(jobTitle).first()).toBeVisible();
  });

  test('global search shows both job and gig result sections', async ({ page }) => {
    await chooseUser(page, 'Client 1');
    await page.getByRole('button', { name: /^Search$/i }).click();

    await page.getByPlaceholder(/Search across all gigs/i).fill('React');
    await page.keyboard.press('Enter');

    await expect(page.getByText(/Matched Gigs/i)).toBeVisible();
    await expect(page.getByText(/Matched Jobs/i)).toBeVisible();
  });

  test('notifications can be opened and marked as read', async ({ page }) => {
    await chooseUser(page, 'Freelancer 2');
    await page.getByRole('button', { name: /Notifications/i }).click();

    await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible();

    const firstNotification = page.locator('main div[style*="cursor: pointer"]').first();
    await expect(firstNotification).toBeVisible();
    await firstNotification.click();
    await expect(page.getByText(/Project|Gig|Job|Proposal|Service|Mandate|Portfolio/i).first()).toBeVisible();

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Freelancer 2');
    await page.getByRole('button', { name: /Notifications/i }).click();
    await expect(page.locator('main div[style*="cursor: pointer"]').first()).toBeVisible();
    await page.getByRole('button', { name: /Mark all as read/i }).click();
    await page.getByRole('button', { name: /Unread/i }).click();
    await expect(page.getByText(/No notifications for this user yet/i)).toBeVisible();
  });

  test('proposal status tabs show pending and accepted proposals for freelancer', async ({ page, request }) => {
    const stamp = Date.now();
    const categoryId = await getWebCategoryId(request);
    const pendingJobTitle = `Pending Proposal Job ${stamp}`;
    const acceptedJobTitle = `Accepted Proposal Job ${stamp}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const pendingJob = await apiJson(request, 'post', '/jobs', {
      user: USERS.client1,
      data: {
        title: pendingJobTitle,
        description: 'Pending proposal tab E2E job.',
        category_id: categoryId,
        project_type: 'fixed_price',
        budget_min: 300,
        budget_max: 800,
        expires_at: expiresAt,
      },
    });
    const acceptedJob = await apiJson(request, 'post', '/jobs', {
      user: USERS.client3,
      data: {
        title: acceptedJobTitle,
        description: 'Accepted proposal tab E2E job.',
        category_id: categoryId,
        project_type: 'fixed_price',
        budget_min: 300,
        budget_max: 800,
        expires_at: expiresAt,
      },
    });

    await apiJson(request, 'post', '/bids', {
      user: USERS.freelancer4,
      data: {
        job_id: pendingJob.id,
        bid_amount: 510,
        bid_type: 'fixed_price',
        duration_label: '1 week',
        cover_letter: 'Pending proposal for tab verification.',
        milestones: [],
      },
    });
    const acceptedBid = await apiJson(request, 'post', '/bids', {
      user: USERS.freelancer4,
      data: {
        job_id: acceptedJob.id,
        bid_amount: 610,
        bid_type: 'fixed_price',
        duration_label: '2 weeks',
        cover_letter: 'Accepted proposal for tab verification.',
        milestones: [],
      },
    });
    await apiJson(request, 'put', `/bids/${acceptedBid.id}/accept`, {
      user: USERS.client3,
      data: { job_id: acceptedJob.id },
    });

    await chooseUser(page, 'Freelancer 4');
    await page.getByText(/^My Proposals$/i).click();

    await expect(page.getByRole('heading', { name: /My Proposals/i })).toBeVisible();
    await expect(page.getByText(pendingJobTitle).first()).toBeVisible();

    await page.getByRole('button', { name: /^Accepted$/i }).click();
    await expect(page.getByText(acceptedJobTitle).first()).toBeVisible();
    await expect(page.getByText(/Accepted/i).first()).toBeVisible();
  });

  test('complete marketplace flow: publish gig, post job, submit proposal, accept bid, verify projects', async ({ page, request }) => {
    const stamp = Date.now();
    const categoryId = await getWebCategoryId(request);
    const gigTitle = `E2E Full Flow Gig ${stamp}`;
    const jobTitle = `E2E Full Flow Job ${stamp}`;

    await apiJson(request, 'post', '/gigs', {
      user: USERS.freelancer4,
      data: {
        title: gigTitle,
        description: 'Automated E2E gig for marketplace cross-account visibility.',
        category_id: categoryId,
        required_skills: ['Playwright', 'React'],
        status: 'live',
        pricing_tiers: [
          { tier: 'basic', package_name: 'Starter', description: 'Basic package', price: 120, delivery_days: 3 },
          { tier: 'standard', package_name: 'Growth', description: 'Standard package', price: 240, delivery_days: 5 },
          { tier: 'premium', package_name: 'Scale', description: 'Premium package', price: 480, delivery_days: 8 },
        ],
      },
    });

    await chooseUser(page, 'Client 1');
    await page.getByRole('button', { name: /Marketplace/i }).first().click();
    await page.getByPlaceholder(/Search services/i).fill(gigTitle);
    await expect(page.getByText(gigTitle).first()).toBeVisible();

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const job = await apiJson(request, 'post', '/jobs', {
      user: USERS.client3,
      data: {
        title: jobTitle,
        description: 'Automated E2E job for proposal acceptance and project creation.',
        category_id: categoryId,
        project_type: 'fixed_price',
        budget_min: 300,
        budget_max: 900,
        expires_at: expiresAt,
      },
    });

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Freelancer 4');
    await page.getByRole('button', { name: /Find Work/i }).click();
    await page.getByPlaceholder(/React Developer|UI Designer/i).fill(jobTitle);
    await expect(page.getByText(jobTitle).first()).toBeVisible();

    const bid = await apiJson(request, 'post', '/bids', {
      user: USERS.freelancer4,
      data: {
        job_id: job.id,
        bid_amount: 650,
        bid_type: 'fixed_price',
        duration_label: '2 weeks',
        cover_letter: 'I can deliver this E2E-tested project with clear milestones and communication.',
        milestones: [{ title: 'Delivery', amount: 650 }],
      },
    });

    await apiJson(request, 'put', `/bids/${bid.id}/accept`, {
      user: USERS.client3,
      data: { job_id: job.id },
    });

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Client 3');
    await page.getByRole('button', { name: /Track Projects/i }).click();
    await page.getByPlaceholder(/Search your projects/i).fill(jobTitle);
    await expect(page.getByText(jobTitle).first()).toBeVisible();

    await page.getByRole('button', { name: /Switch Role/i }).click();
    await chooseUser(page, 'Freelancer 4');
    await page.getByRole('button', { name: /Active Projects/i }).first().click();
    await page.getByPlaceholder(/Search your projects/i).fill(jobTitle);
    await expect(page.getByText(jobTitle).first()).toBeVisible();
  });
});
