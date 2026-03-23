import { describe, it, expect, vi } from 'vitest';
import { toolsHandlers } from '../services/tools.js';

describe('Tools Handlers Integration', () => {
  it('calculate: should compute math expression safely', async () => {
    const res = await toolsHandlers.calculate({ expression: '2 + 2 * 2' });
    expect(res.result).toBe(6);
  });

  it('calculate: should fail on malicious code', async () => {
    const res = await toolsHandlers.calculate({ expression: 'while(true){}' });
    expect(res.error).toBeDefined();
  });

  it('bash: should allow whitelisted command like echo', async () => {
    const res = await toolsHandlers.bash({ command: 'echo "Hello Autonomiczne Biuro"' });
    expect(res.result).toMatch(/Hello Autonomiczne Biuro/);
  });

  it('bash: should reject non-whitelisted commands', async () => {
    const res = await toolsHandlers.bash({ command: 'rm -rf /' });
    expect(res.error).toContain('Command not allowed');
  });

  it('get_current_time: should return valid ISO date', async () => {
    const res = await toolsHandlers.get_current_time({});
    expect(new Date(res.time).getTime()).not.toBeNaN();
  });

  it('web_search: should handle search results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ AbstractText: "Test search result" })
    });
    vi.stubGlobal('fetch', mockFetch);
    const res = await toolsHandlers.web_search({ query: 'test' });
    expect(res.result).toBe("Test search result");
    vi.unstubAllGlobals();
  });

  it('send_email: should return success', async () => {
    const res = await toolsHandlers.send_email({ to: 'test@example.com', subject: 'hi', body: 'body' });
    expect(res.success).toBe(true);
  });

  it('analytics: should return dummy data', async () => {
    const res = await toolsHandlers.analytics();
    expect(res.mrr).toBe(15000);
  });

  it('api_call: should restrict to HTTPS', async () => {
    const res = await toolsHandlers.api_call({ url: 'http://insecure.com' });
    expect(res.error).toBe('Only HTTPS allowed');
  });

  it('file_read and file_write: should manage files in data dir', async () => {
    const testFile = 'test.txt';
    const content = 'Hello world';
    await toolsHandlers.file_write({ path: testFile, content });
    const res = await toolsHandlers.file_read({ path: testFile });
    expect(res.content).toBe(content);
  });

  it('jira_create: should return mock ticket ID', async () => {
    const res = await toolsHandlers.jira_create({ title: 'Fix bug', description: 'Very urgent' });
    expect(res.ticketId).toBeDefined();
  });
});
