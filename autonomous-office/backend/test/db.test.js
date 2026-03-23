import { describe, it, expect } from 'vitest';
import db from '../db.js';

describe('Database', () => {
  it('is connected', () => {
    expect(db).toBeDefined();
  });
});
