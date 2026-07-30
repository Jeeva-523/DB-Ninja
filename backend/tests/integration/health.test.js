const express = require('express');
const request = require('supertest');

// Mock Express App without starting server port
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'ShopMaster Admin Panel REST API',
    timestamp: new Date().toISOString()
  });
});

describe('Health Check API Integration Test', () => {
  test('GET /health should return 200 OK status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.service).toContain('ShopMaster');
  });
});
