import db from '../db.js';

export function setupTestDb() {
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM audit_log');
  db.exec('DELETE FROM responses');
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM goals');
  db.exec('DELETE FROM agent_tools');
  db.exec('DELETE FROM agent_rate_limits');
  db.exec('DELETE FROM prompt_versions');
  db.exec('DELETE FROM daily_cost_snapshots');
  db.exec('DELETE FROM agents');
  db.pragma('foreign_keys = ON');
  // keep base company intact or recreate
  
  const insertCompany = db.prepare('INSERT INTO companies (name) VALUES (?)');
  const info = insertCompany.run('Test Company');
  return info.lastInsertRowid;
}
