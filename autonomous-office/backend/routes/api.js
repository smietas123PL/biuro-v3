import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.get('/audit', (req, res) => res.json(db.prepare('SELECT * FROM audit_log ORDER BY ts DESC LIMIT 100').all()));

// Companies
router.get('/companies', (req, res) => res.json(db.prepare('SELECT * FROM companies').all()));
router.post('/companies', (req, res) => {
  const info = db.prepare('INSERT INTO companies (name, mission) VALUES (?, ?)').run(req.body.name, req.body.mission);
  res.json({ id: info.lastInsertRowid });
});
router.patch('/companies/:id', (req, res) => res.json({ success: true }));
router.delete('/companies/:id', (req, res) => res.json({ success: true }));
router.get('/companies/:id/costs', (req, res) => res.json([]));
router.get('/companies/:id/budget_alerts', (req, res) => res.json([]));
router.patch('/companies/:id/budget-limit', (req, res) => res.json({ success: true }));
router.get('/companies/:id/approval-rules', (req, res) => {
  res.json(db.prepare('SELECT * FROM company_approval_rules WHERE company_id = ?').all(req.params.id));
});
router.post('/companies/:id/approval-rules', (req, res) => {
  const { condition_type, threshold_value, label } = req.body;
  const info = db.prepare('INSERT INTO company_approval_rules (company_id, condition_type, threshold_value, label) VALUES (?, ?, ?, ?)')
    .run(req.params.id, condition_type, threshold_value, label);
  res.json({ id: info.lastInsertRowid });
});
router.post('/companies/:id/approval-rules/seed', (req, res) => res.json({ success: true }));
router.get('/companies/:id/queue', (req, res) => {
  const data = db.prepare('SELECT * FROM tasks WHERE company_id = ? AND status IN (\'pending\', \'working\') ORDER BY priority ASC, created_at ASC').all(req.params.id);
  res.json(data);
});
router.get('/companies/:id/queue/stats', (req, res) => res.json({}));
router.get('/companies/:id/feedback-stats', (req, res) => res.json({}));
router.get('/companies/:id/rate-limits', (req, res) => {
  const tools = db.prepare('SELECT * FROM tools').all();
  res.json(tools);
});
router.get('/companies/:id/graph', (req, res) => {
  // Dla DependencyGraph pobieramy agentów i mapujemy parent_id -> id
  const agents = db.prepare('SELECT id, name, parent_id FROM agents WHERE company_id = ?').all(req.params.id);
  res.json({
    nodes: agents.map(a => ({ id: a.id, label: a.name })),
    links: agents.filter(a => a.parent_id).map(a => ({ source: a.parent_id, target: a.id }))
  });
});
router.get('/companies/:id/export/audit', (req, res) => {
  res.json(db.prepare('SELECT * FROM audit_log WHERE company_id = ?').all(req.params.id));
});
router.get('/companies/:id/export/costs', (req, res) => {
  res.json(db.prepare('SELECT * FROM responses JOIN tasks ON responses.task_id = tasks.id WHERE tasks.company_id = ?').all(req.params.id));
});
router.get('/companies/:id/export/tasks', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks WHERE company_id = ?').all(req.params.id));
});
router.get('/companies/:id/export/report', (req, res) => res.json([]));

// Templates
router.get('/templates', (req, res) => res.json(db.prepare('SELECT * FROM templates').all()));
router.post('/templates/:id/apply', (req, res) => {
  const companyId = 1; // Default
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  
  const payload = JSON.parse(template.payload || '{}');
  const { agents = [], goals = [], rules = [] } = payload;
  
  // Wipe current state for this demo (for simplicty in demo)
  db.prepare('DELETE FROM audit_log WHERE company_id = ?').run(companyId);
  db.prepare('DELETE FROM responses WHERE agent_id IN (SELECT id FROM agents WHERE company_id = ?)').run(companyId);
  db.prepare('DELETE FROM tasks WHERE company_id = ?').run(companyId);
  db.prepare('DELETE FROM agents WHERE company_id = ?').run(companyId);
  db.prepare('DELETE FROM goals WHERE company_id = ?').run(companyId);
  db.prepare('DELETE FROM company_approval_rules WHERE company_id = ?').run(companyId);

  // Add new agents
  for (const agent of agents) {
    db.prepare('INSERT INTO agents (company_id, name, role, model, status, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run(companyId, agent.name, agent.role, agent.model, 'idle', 1);
  }

  // Add goals
  for (const goal of goals) {
    db.prepare('INSERT INTO goals (company_id, title, description) VALUES (?, ?, ?)')
      .run(companyId, goal.title, goal.description);
  }

  // Add rules
  for (const rule of rules) {
    db.prepare('INSERT INTO company_approval_rules (company_id, condition_type, threshold_value, label, enabled) VALUES (?, ?, ?, ?, ?)')
      .run(companyId, rule.condition_type, rule.threshold_value, rule.label, 1);
  }

  res.json({ success: true, message: `Template ${template.name} applied successfully.` });
});

// Agents
router.get('/agents', (req, res) => res.json(db.prepare('SELECT * FROM agents').all()));
router.post('/agents', (req, res) => {
  const { company_id, name, role, model, api_key } = req.body;
  const info = db.prepare('INSERT INTO agents (company_id, name, role, model, api_key) VALUES (?, ?, ?, ?, ?)').run(company_id, name, role, model, api_key);
  res.json({ id: info.lastInsertRowid });
});
router.delete('/agents/:id', (req, res) => {
  db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
router.patch('/agents/:id/budget', (req, res) => res.json({ success: true }));
router.patch('/agents/:id/active', (req, res) => res.json({ success: true }));
router.patch('/agents/:id/parent', (req, res) => res.json({ success: true }));
router.get('/agents/:id/responses', (req, res) => res.json([]));
router.get('/agents/:id/tools', (req, res) => res.json([]));
router.post('/agents/:id/tools', (req, res) => res.json({ success: true }));
router.delete('/agents/:id/tools/:tool_id', (req, res) => res.json({ success: true }));
router.get('/agents/:id/tasks', (req, res) => res.json([]));
router.get('/agents/:id/queue', (req, res) => res.json([]));
router.get('/agents/:id/rate-limits', (req, res) => res.json({}));
router.put('/agents/:id/rate-limits', (req, res) => res.json({ success: true }));
router.delete('/agents/:id/rate-limits', (req, res) => res.json({ success: true }));
router.post('/agents/:id/rate-limits/reset-counters', (req, res) => res.json({ success: true }));
router.get('/agents/:id/prompt-versions', (req, res) => {
  res.json(db.prepare('SELECT * FROM prompt_versions WHERE agent_id = ? ORDER BY version DESC').all(req.params.id));
});
router.post('/agents/:id/prompt-versions', (req, res) => {
  const { system_prompt, label, notes, version } = req.body;
  const info = db.prepare('INSERT INTO prompt_versions (agent_id, company_id, version, label, system_prompt, notes) VALUES (?, 1, ?, ?, ?, ?)')
    .run(req.params.id, version, label, system_prompt, notes);
  res.json({ id: info.lastInsertRowid });
});
router.post('/agents/:id/prompt-versions/from-template', (req, res) => res.json({ success: true }));
router.get('/agents/:id/prompt-versions/diff', (req, res) => res.json({}));
router.get('/agents/:id/prompt-versions/stats', (req, res) => res.json({}));
router.get('/agents/:id/ab-tests', (req, res) => res.json([]));
router.post('/agents/:id/ab-tests', (req, res) => res.json({ success: true }));

// Goals
router.get('/goals', (req, res) => res.json(db.prepare('SELECT * FROM goals').all()));
router.post('/goals', (req, res) => {
  const { company_id, title, description } = req.body;
  const info = db.prepare('INSERT INTO goals (company_id, title, description) VALUES (?, ?, ?)').run(company_id, title, description);
  res.json({ id: info.lastInsertRowid });
});
router.delete('/goals/:id', (req, res) => res.json({ success: true }));

// Tools
router.get('/tools', (req, res) => res.json(db.prepare('SELECT * FROM tools').all()));
router.post('/tools', (req, res) => res.json({ success: true }));

// Tasks
router.get('/tasks/:agent_id', (req, res) => res.json(db.prepare('SELECT * FROM tasks WHERE agent_id = ? ORDER BY created_at DESC').all(req.params.agent_id)));
router.get('/tasks/:task_id/response', (req, res) => {
  const response = db.prepare('SELECT * FROM responses WHERE task_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.task_id);
  res.json(response || {});
});
router.get('/tasks/pending/approvals', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks WHERE requires_approval = 1 AND approved = 0 ORDER BY created_at DESC').all());
});
router.post('/tasks', (req, res) => {
  const { company_id, agent_id, goal_id, description } = req.body;
  const info = db.prepare('INSERT INTO tasks (company_id, agent_id, goal_id, description) VALUES (?, ?, ?, ?)').run(company_id, agent_id, goal_id, description);
  res.json({ id: info.lastInsertRowid });
});
router.patch('/tasks/:id/approve', (req, res) => {
  db.prepare('UPDATE tasks SET approved = 1, status = \'pending\' WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
router.patch('/tasks/:id/reject', (req, res) => {
  db.prepare('UPDATE tasks SET status = \'rejected\' WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
router.patch('/tasks/:id/done', (req, res) => res.json({ success: true }));
router.patch('/tasks/:id/priority', (req, res) => res.json({ success: true }));
router.patch('/tasks/:id/schedule', (req, res) => res.json({ success: true }));
router.patch('/tasks/:id/archive', (req, res) => res.json({ success: true }));
router.patch('/tasks/:id/unarchive', (req, res) => res.json({ success: true }));
router.post('/tasks/:id/delegate', (req, res) => res.json({ success: true }));
router.get('/tasks/:id/feedback-chain', (req, res) => res.json([]));
router.get('/tasks/:id/continuation-chain', (req, res) => res.json([]));
router.get('/tasks/:id/subgraph', (req, res) => res.json([]));

// Other endpoints
router.post('/heartbeat', (req, res) => res.json({ success: true }));
router.get('/responses/:id/children', (req, res) => res.json([]));
router.post('/responses/:id/continue', (req, res) => res.json({ success: true }));
router.patch('/approval-rules/:id', (req, res) => res.json({ success: true }));
router.delete('/approval-rules/:id', (req, res) => res.json({ success: true }));
router.get('/prompt-templates', (req, res) => res.json([]));
router.post('/prompt-templates', (req, res) => res.json({ success: true }));
router.delete('/prompt-templates/:id', (req, res) => res.json({ success: true }));
router.patch('/prompt-versions/:id', (req, res) => res.json({ success: true }));
router.patch('/prompt-versions/:id/activate', (req, res) => res.json({ success: true }));
router.delete('/prompt-versions/:id', (req, res) => res.json({ success: true }));
router.patch('/ab-tests/:id/end', (req, res) => res.json({ success: true }));

export default router;
