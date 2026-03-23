import db from '../db.js';

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mission TEXT,
      monthly_budget_limit REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      name TEXT NOT NULL,
      role TEXT,
      model TEXT,
      endpoint TEXT,
      api_key TEXT,
      budget REAL DEFAULT 0.0,
      initial_budget REAL DEFAULT 0.0,
      status TEXT DEFAULT 'idle',
      active INTEGER DEFAULT 1,
      parent_id INTEGER,
      last_heartbeat DATETIME,
      active_prompt_version_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      agent_id INTEGER,
      goal_id INTEGER,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 0,
      scheduled_for DATETIME,
      requires_approval INTEGER DEFAULT 0,
      approved INTEGER DEFAULT 0,
      approval_reason TEXT,
      delegate_to_agent_id INTEGER,
      delegated_from_agent_id INTEGER,
      delegate_reason TEXT,
      parent_task_id INTEGER,
      depth INTEGER DEFAULT 0,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      last_error TEXT,
      archived_at DATETIME,
      blocked_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id),
      FOREIGN KEY(agent_id) REFERENCES agents(id),
      FOREIGN KEY(goal_id) REFERENCES goals(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      agent_id INTEGER,
      agent_name TEXT,
      action TEXT,
      detail TEXT,
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      limit_per_hour INTEGER DEFAULT 0,
      schema TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER,
      tool_id INTEGER,
      uses_this_hour INTEGER DEFAULT 0,
      hour_bucket TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(agent_id, tool_id),
      FOREIGN KEY(agent_id) REFERENCES agents(id),
      FOREIGN KEY(tool_id) REFERENCES tools(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      agent_id INTEGER,
      prompt TEXT,
      response TEXT,
      model TEXT,
      tokens_in INTEGER DEFAULT 0,
      tokens_out INTEGER DEFAULT 0,
      cost REAL DEFAULT 0.0,
      conversation TEXT,
      parent_response_id INTEGER,
      prompt_version_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS company_approval_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      condition_type TEXT,
      threshold_value TEXT,
      requires_approval INTEGER DEFAULT 1,
      label TEXT,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS daily_cost_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      agent_id INTEGER,
      date TEXT,
      total_cost REAL DEFAULT 0.0,
      call_count INTEGER DEFAULT 0,
      UNIQUE(company_id, agent_id, date),
      FOREIGN KEY(company_id) REFERENCES companies(id),
      FOREIGN KEY(agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS budget_alert_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      alert_type TEXT,
      threshold_pct REAL,
      current_cost REAL,
      budget_limit REAL,
      detail TEXT,
      fired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged INTEGER DEFAULT 0,
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS prompt_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER,
      company_id INTEGER,
      version INTEGER,
      label TEXT,
      system_prompt TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 0,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(agent_id, version),
      FOREIGN KEY(agent_id) REFERENCES agents(id),
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS prompt_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role_hint TEXT,
      description TEXT,
      system_prompt TEXT,
      variables TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER UNIQUE,
      daily_budget REAL DEFAULT 0.0,
      monthly_budget REAL DEFAULT 0.0,
      max_llm_calls_per_hour INTEGER DEFAULT 0,
      max_llm_calls_per_day INTEGER DEFAULT 0,
      max_tokens_per_call INTEGER DEFAULT 0,
      cooldown_seconds INTEGER DEFAULT 0,
      last_llm_call_at DATETIME,
      calls_this_hour INTEGER DEFAULT 0,
      calls_today INTEGER DEFAULT 0,
      cost_today REAL DEFAULT 0.0,
      cost_this_month REAL DEFAULT 0.0,
      hour_bucket TEXT,
      day_bucket TEXT,
      month_bucket TEXT,
      on_limit_action TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(agent_id) REFERENCES agents(id)
    );
  `);

  seedData();
}

function seedData() {
  const companyCount = db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
  if (companyCount > 0) return;

  const insertCompany = db.prepare('INSERT INTO companies (name, mission, monthly_budget_limit) VALUES (?, ?, ?)');
  const res = insertCompany.run('Moja Firma', 'Zautomatyzować wszystko co możliwe', 5.00);
  const companyId = res.lastInsertRowid;

  // Seeding default agent
  const insertAgent = db.prepare('INSERT INTO agents (company_id, name, role, model, budget, initial_budget) VALUES (?, ?, ?, ?, ?, ?)');
  const agentRes = insertAgent.run(companyId, 'Asystent AI', 'Ogólny', 'gpt-3.5-turbo', 2.00, 2.00);
  const agentId = agentRes.lastInsertRowid;

  // Seeding default task
  const insertTask = db.prepare('INSERT INTO tasks (company_id, agent_id, description, status, requires_approval) VALUES (?, ?, ?, ?, ?)');
  insertTask.run(companyId, agentId, 'Przeanalizuj dzisiejsze maile i przygotuj podsumowanie', 'pending', 0);
  insertTask.run(companyId, agentId, 'Zaktualizuj budżet w systemie', 'completed', 0);
  insertTask.run(companyId, agentId, 'Kup nową subskrypcję za 99$', 'pending', 1);

  const tools = [
    'web_search', 'calculate', 'get_current_time', 'send_email', 'bash',
    'analytics', 'api_call', 'slack_message', 'file_read', 'file_write', 'jira_create'
  ];
  const insertTool = db.prepare('INSERT OR IGNORE INTO tools (name, schema) VALUES (?, ?)');
  tools.forEach(t => insertTool.run(t, '{}'));

  const templates = [
    { name: 'SaaS Startup', payload: '{}' },
    { name: 'Marketing Agency', payload: '{}' },
    { name: 'Support Team', payload: '{}' }
  ];
  const insertTemplate = db.prepare('INSERT INTO templates (name, payload) VALUES (?, ?)');
  templates.forEach(t => insertTemplate.run(t.name, t.payload));

  const insertRule = db.prepare('INSERT INTO company_approval_rules (company_id, condition_type, threshold_value, label) VALUES (?, ?, ?, ?)');
  for (let i = 0; i < 9; i++) {
    insertRule.run(companyId, 'cost_exceeds', '1.0', `Reguła testowa ${i+1}`);
  }

  const insertPromptTemplate = db.prepare('INSERT INTO prompt_templates (name, role_hint, description, system_prompt, variables) VALUES (?, ?, ?, ?, ?)');
  for (let i = 0; i < 5; i++) {
    insertPromptTemplate.run(`Szablon Promptu ${i+1}`, 'Assistant', 'Opis', 'Jesteś pomocnym asystentem.', '[]');
  }
}
