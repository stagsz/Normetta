import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('uptime');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(typeof response.body.version).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should include version from package.json', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      // Version should be a semver-like string
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return 200 and readiness status when ready', async () => {
      const response = await request(app).get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database', true);
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
