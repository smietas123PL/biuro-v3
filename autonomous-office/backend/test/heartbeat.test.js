import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAgents } from '../services/heartbeat.js';
import db from '../db.js';
import { setupTestDb } from './helpers.js';
import * as llm from '../services/llm.js';

vi.mock('../services/llm.js', () => ({
  callLLMWithTools: vi.fn()
}));

describe('Heartbeat Service', () => {
  let companyId;

  beforeEach(() => {
    companyId = setupTestDb();
  });

  it('processes tasks for idle agents', async () => {
    // 1. Create agent
    const agentId = db.prepare('INSERT INTO agents (company_id, name, role, model, status, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run(companyId, 'Heartbeat Agent', 'Tester', 'gemini', 'idle', 1).lastInsertRowid;
    
    // 2. Create task
    const taskId = db.prepare('INSERT INTO tasks (company_id, agent_id, description, status) VALUES (?, ?, ?, ?)')
      .run(companyId, agentId, 'Test task heartbeat', 'pending').lastInsertRowid;
    
    // 3. Mock LLM response
    llm.callLLMWithTools.mockResolvedValue({ text: 'Done!', cost: 0.005 });
    
    // 4. Run processing
    await processAgents();
    
    // 5. Verify task is completed
    const task = db.prepare('SELECT status FROM tasks WHERE id = ?').get(taskId);
    expect(task.status).toBe('completed');
    
    // 6. Verify agent is idle again
    const agent = db.prepare('SELECT status FROM agents WHERE id = ?').get(agentId);
    expect(agent.status).toBe('idle');

    // 7. Check audit log
    const log = db.prepare('SELECT action FROM audit_log WHERE agent_id = ? AND action = ?').get(agentId, 'TASK_COMPLETED');
    expect(log).toBeDefined();
  });
});
