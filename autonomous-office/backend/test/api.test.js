import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { setupTestDb } from './helpers.js';

describe('API Endpoints', () => {
  let companyId;

  beforeEach(() => {
    companyId = setupTestDb();
  });

  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/companies returns companies', async () => {
    const res = await request(app).get('/api/companies');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  describe('Agents', () => {
    it('POST /api/agents creates an agent', async () => {
      const res = await request(app).post('/api/agents').send({
        company_id: companyId,
        name: 'Test Agent',
        role: 'Tester',
        model: 'gemini-pro',
        api_key: 'test-key'
      });
      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
    });

    it('GET /api/agents returns list of agents', async () => {
      // First create one
      await request(app).post('/api/agents').send({
        company_id: companyId,
        name: 'Agent List Test',
        role: 'Assistant',
        model: 'gemini-pro',
        api_key: 'test-key'
      });
      const res = await request(app).get('/api/agents');
      expect(res.status).toBe(200);
      expect(res.body.some(a => a.name === 'Agent List Test')).toBe(true);
    });

    it('DELETE /api/agents/:id removes an agent', async () => {
      const createRes = await request(app).post('/api/agents').send({
        company_id: companyId,
        name: 'Agent To Delete',
        role: 'Assistant',
        model: 'gemini-pro',
        api_key: 'test-key'
      });
      const agentId = createRes.body.id;
      const delRes = await request(app).delete(`/api/agents/${agentId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      const listRes = await request(app).get('/api/agents');
      expect(listRes.body.some(a => a.id === agentId)).toBe(false);
    });
  });

  describe('Tasks', () => {
    let agentId;

    beforeEach(async () => {
      const res = await request(app).post('/api/agents').send({
        company_id: companyId,
        name: 'Task Runner',
        role: 'Assistant',
        model: 'gemini-pro',
        api_key: 'test-key'
      });
      agentId = res.body.id;
    });

    it('POST /api/tasks creates a task', async () => {
      const res = await request(app).post('/api/tasks').send({
        company_id: companyId,
        agent_id: agentId,
        goal_id: null,
        description: 'New Task'
      });
      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
    });

    it('GET /api/tasks/:agent_id returns agent tasks', async () => {
      await request(app).post('/api/tasks').send({
        company_id: companyId,
        agent_id: agentId,
        goal_id: null,
        description: 'Task for agent'
      });
      const res = await request(app).get(`/api/tasks/${agentId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('PATCH /api/tasks/:id/approve updates task status', async () => {
      const createRes = await request(app).post('/api/tasks').send({
        company_id: companyId,
        agent_id: agentId,
        goal_id: null,
        description: 'Approve test'
      });
      const taskId = createRes.body.id;
      const res = await request(app).patch(`/api/tasks/${taskId}/approve`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
