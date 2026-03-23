import fs from 'fs';
import path from 'path';
import { evaluate } from 'mathjs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const WORKSPACE_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data');

export const toolsHandlers = {
  web_search: async (args) => {
    try {
      const query = encodeURIComponent(args.query);
      const response = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json`);
      const data = await response.json();
      return { result: data.AbstractText || data.Abstract || (data.RelatedTopics && data.RelatedTopics[0]?.Text) || "Brak wyników." };
    } catch (e) {
      return { error: 'Search failed: ' + e.message };
    }
  },
  calculate: async (args) => {
    try {
      const result = evaluate(args.expression);
      return { result };
    } catch (e) {
      return { error: 'Calculation failed: ' + e.message };
    }
  },
  get_current_time: async () => ({ time: new Date().toISOString() }),
  send_email: async (args) => {
    console.log(`Mock send_email to ${args.to}`);
    return { success: true, message: `Email simulated sent to ${args.to}` };
  },
  bash: async (args) => {
    const whitelist = ['echo', 'date', 'ls', 'cat', 'pwd', 'wc', 'head', 'tail'];
    const cmd = args.command?.trim().split(' ')[0] || '';
    if (whitelist.includes(cmd)) {
      try {
        const { stdout, stderr } = await execAsync(args.command, { timeout: 5000, cwd: WORKSPACE_DIR });
        return { result: stdout || stderr };
      } catch (e) {
        return { error: e.message };
      }
    }
    return { error: 'Command not allowed. Use whitelist: ' + whitelist.join(', ') };
  },
  analytics: async () => ({ mrr: 15000, churn: 2.1, cac: 150 }),
  api_call: async (args) => {
    if (!args.url?.startsWith('https://')) return { error: 'Only HTTPS allowed' };
    try {
      const response = await fetch(args.url, {
        method: args.method || 'GET',
        headers: args.headers || {},
        body: args.body ? JSON.stringify(args.body) : undefined
      });
      const data = await response.text();
      return { status: response.status, data: data.slice(0, 1000) }; // Limit response size
    } catch (e) {
      return { error: e.message };
    }
  },
  slack_message: async (args) => {
    console.log(`Mock slack message to ${args.channel}`);
    return { success: true };
  },
  file_read: async (args) => {
    try {
      const fullPath = path.join(WORKSPACE_DIR, args.path);
      if (!fullPath.startsWith(WORKSPACE_DIR)) throw new Error('Access denied');
      const content = fs.readFileSync(fullPath, 'utf8');
      return { content };
    } catch (e) {
      return { error: e.message };
    }
  },
  file_write: async (args) => {
    try {
      const fullPath = path.join(WORKSPACE_DIR, args.path);
      if (!fullPath.startsWith(WORKSPACE_DIR)) throw new Error('Access denied');
      fs.writeFileSync(fullPath, args.content || '');
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },
  jira_create: async (args) => {
    console.log(`Mock Jira ticket: ${args.title}`);
    return { ticketId: 'PROJ-123' };
  }
};
