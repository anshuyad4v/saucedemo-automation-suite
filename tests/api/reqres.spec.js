const { test, expect } = require('@playwright/test');

const API_URL = 'https://reqres.in/api';

// reqres.in asks public clients to send its documented free key, otherwise
// requests from shared IPs (for example GitHub Actions runners) can be rejected.
test.use({ extraHTTPHeaders: { 'x-api-key': 'reqres-free-v1' } });

test.describe('Reqres REST API tests', () => {

  test('API-01: GET /users/2 returns 200 with a complete user object', async ({ request }) => {
    const response = await request.get(`${API_URL}/users/2`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toMatchObject({
      id: 2,
      email: 'janet.weaver@reqres.in',
      first_name: 'Janet',
      last_name: 'Weaver'
    });
    expect(typeof body.data.avatar).toBe('string');
    expect(body.data.avatar).toMatch(/^https?:\/\//);
    expect(body).toHaveProperty('support.url');
  });

  test('API-02: POST /users creates a resource and returns 201 with the sent data', async ({ request }) => {
    const payload = { name: 'Anshu', job: 'Automation Engineer' };

    const response = await request.post(`${API_URL}/users`, { data: payload });
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
    expect(typeof body.id).toBe('string');
    expect(Number.isNaN(new Date(body.createdAt).getTime())).toBe(false);
  });

  test('API-03: POST /register with a missing password returns 400 and an error message', async ({ request }) => {
    const response = await request.post(`${API_URL}/register`, {
      data: { email: 'eve.holt@reqres.in' } // password intentionally omitted
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'Missing password' });
  });

  test('API-04: GET /users/23 returns 404 with an empty body for an unknown id', async ({ request }) => {
    const response = await request.get(`${API_URL}/users/23`);
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body).toEqual({});
  });
});
