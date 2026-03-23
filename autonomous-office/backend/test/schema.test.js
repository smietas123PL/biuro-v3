import { describe, it, expect } from 'vitest';
import { initializeDatabase } from '../database/schema.js';

describe('Database Schema', () => {
  it('is defined', () => {
    expect(initializeDatabase).toBeDefined();
  });
});
