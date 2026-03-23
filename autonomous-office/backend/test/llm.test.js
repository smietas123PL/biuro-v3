import { describe, it, expect, vi } from 'vitest';
import { callLLMWithTools } from '../services/llm.js';
import { encrypt } from '../utils/encryption.js';

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Mocked Gemini response'
          }
        })
      })
    }))
  };
});

describe('LLM Service', () => {
  it('calls gemini model correctly', async () => {
    const encryptedKey = encrypt('real-key');
    const agent = { name: 'AI', model: 'gemini-1.5-flash', role: 'Tester', api_key: encryptedKey };
    const task = { description: 'Do something' };
    const tools = [{ name: 'calculate' }];
    
    const res = await callLLMWithTools(agent, task, tools);
    expect(res.text).toBe('Mocked Gemini response');
    expect(res.cost).toBe(0.001);
  });

  it('handles custom models as simulation', async () => {
    const agent = { name: 'AI', model: 'custom-model' };
    const task = { description: 'Custom task' };
    const res = await callLLMWithTools(agent, task, []);
    expect(res.text).toContain('Simulated response');
  });
});
