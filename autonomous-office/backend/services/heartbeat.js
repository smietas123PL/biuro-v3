import db from '../db.js';
import { toolsHandlers } from './tools.js';
import { callLLMWithTools } from './llm.js';

export async function processAgents() {
  try {
    // 1. Fetch agents
    const agents = db.prepare('SELECT * FROM agents WHERE active = 1 AND status = \'idle\'').all();
    
    for (const agent of agents) {
      // 4. Fetch next task
      // ... (rest of the logic)
        // We only process tasks that don't require approval, OR ones that require approval but are already approved.
        const task = db.prepare(`
          SELECT * FROM tasks 
          WHERE agent_id = ? 
          AND status = 'pending' 
          AND (requires_approval = 0 OR approved = 1)
          AND (scheduled_for IS NULL OR scheduled_for <= datetime('now')) 
          AND archived_at IS NULL 
          ORDER BY priority ASC, created_at ASC LIMIT 1
        `).get(agent.id);
        
        if (task) {
          // 5. PRE-LLM check (Security & Budget)
          if (agent.budget <= 0 && agent.initial_budget > 0) {
            console.log(`Agent ${agent.name} skipped: budget empty.`);
            db.prepare('UPDATE agents SET active = 0 WHERE id = ?').run(agent.id);
            continue;
          }

          // 12. Update agent status
          db.prepare('UPDATE agents SET status = \'working\', last_heartbeat = datetime(\'now\') WHERE id = ?').run(agent.id);
          
          // 6. Call LLM
          console.log(`Agent ${agent.name} processing task ${task.id}: ${task.description}`);
          db.prepare('INSERT INTO audit_log (company_id, agent_id, agent_name, action, detail) VALUES (?, ?, ?, ?, ?)')
            .run(agent.company_id, agent.id, agent.name, 'TASK_STARTED', `Started working on task: ${task.description}`);
          
          const tools = db.prepare('SELECT name, schema FROM tools JOIN agent_tools ON tools.id = agent_tools.tool_id WHERE agent_tools.agent_id = ?').all(agent.id);
          
          const llmResult = await callLLMWithTools(agent, task, tools);
          
          // 7. Post-LLM check approval rules (jeśli koszt wygenerowany przez LLM przekracza threshold ustalony w firmie)
          const rules = db.prepare('SELECT * FROM company_approval_rules WHERE company_id = ? AND enabled = 1 AND condition_type = \'cost_exceeds\'').all(agent.company_id);
          let requiresPostApproval = false;
          
          for (const rule of rules) {
             const threshold = parseFloat(rule.threshold_value);
             if (!isNaN(threshold) && llmResult.cost > threshold) {
               requiresPostApproval = true;
               db.prepare('UPDATE tasks SET requires_approval = 1, approved = 0, approval_reason = ? WHERE id = ?')
                 .run(`Koszt $${llmResult.cost} przekroczył regułę: ${rule.label}`, task.id);
             }
          }

          if (requiresPostApproval) {
            // Przerywamy procesowanie i nie zapisujemy odpowiedzi dopóki zadanie nie zostanie zatwierdzone post-factum.
            db.prepare('UPDATE agents SET status = \'idle\' WHERE id = ?').run(agent.id);
            continue;
          }
          
          // 8. Wykryj delegację (@mentions)
          const mentions = llmResult.text.match(/@(\w+)/g);
          const MAX_DEPTH = 5;
          if (mentions && (task.depth || 0) < MAX_DEPTH) {
            mentions.forEach(mention => {
               const targetName = mention.substring(1);
               const targetAgent = db.prepare('SELECT id FROM agents WHERE name = ? AND company_id = ?').get(targetName, agent.company_id);
               if (targetAgent) {
                  db.prepare('INSERT INTO tasks (company_id, agent_id, description, parent_task_id, delegated_from_agent_id, depth) VALUES (?, ?, ?, ?, ?, ?)')
                    .run(agent.company_id, targetAgent.id, `Zadanie od ${agent.name}:\n${llmResult.text}`, task.id, agent.id, (task.depth || 0) + 1);
                  
                  db.prepare('INSERT INTO audit_log (company_id, agent_id, agent_name, action, detail) VALUES (?, ?, ?, ?, ?)')
                    .run(agent.company_id, agent.id, agent.name, 'TASK_DELEGATED', `Delegated to @${targetName} (depth: ${(task.depth || 0) + 1})`);
               }
            });
          }
          
          // 9. Wykryj pętlę feedbacku (slowo kluczowe "FEEDBACK")
          if ((llmResult.text.includes('FEEDBACK') || llmResult.text.includes('NIEKOMPLETNE')) && (task.depth || 0) < MAX_DEPTH) {
             db.prepare('INSERT INTO tasks (company_id, agent_id, description, parent_task_id, priority, depth) VALUES (?, ?, ?, ?, ?, ?)')
                .run(agent.company_id, agent.id, `POPRAWKA dla zadania:\n${task.description}\nKomentarz z systemu: Zwrócono FEEDBACK.`, task.id, 1, (task.depth || 0) + 1);
          }
          
          // 10. Save response
          db.prepare('INSERT INTO responses (task_id, agent_id, prompt, response, cost) VALUES (?, ?, ?, ?, ?)').run(task.id, agent.id, task.description, llmResult.text, llmResult.cost);
          
          // 11. Deduct budget
          db.prepare('UPDATE agents SET budget = budget - ? WHERE id = ?').run(llmResult.cost, agent.id);

          // 13. Sprawdź Budget Alerts & auto-shutdown
          const updatedAgent = db.prepare('SELECT budget, initial_budget FROM agents WHERE id = ?').get(agent.id);
          if (updatedAgent.budget <= 0 && updatedAgent.initial_budget > 0) {
            db.prepare('UPDATE agents SET active = 0 WHERE id = ?').run(agent.id);
            db.prepare('INSERT INTO audit_log (company_id, agent_id, agent_name, action, detail) VALUES (?, ?, ?, ?, ?)')
               .run(agent.company_id, agent.id, agent.name, 'AGENT_DEACTIVATED', `Budget limit exceeded.`);
          }
          
          db.prepare('INSERT INTO audit_log (company_id, agent_id, agent_name, action, detail) VALUES (?, ?, ?, ?, ?)')
            .run(agent.company_id, agent.id, agent.name, 'TASK_COMPLETED', `Task finished. Cost: $${llmResult.cost}`);
          
          // Mark task done
          db.prepare('UPDATE tasks SET status = \'completed\' WHERE id = ?').run(task.id);
          db.prepare('UPDATE agents SET status = \'idle\' WHERE id = ?').run(agent.id);
        }
      }
    } catch (e) {
      console.error('Heartbeat error:', e);
    }
}

export function runHeartbeat() {
  setInterval(processAgents, 5000);
}
