import { describe, it, expect } from 'vitest';
import app from '../server.js';

describe('Server', () => {
  it('is defined', () => {
    expect(app).toBeDefined();
  });
});
