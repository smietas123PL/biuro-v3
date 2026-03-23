import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import PromptVersionManager from './PromptVersionManager';

describe('PromptVersionManager', () => {
  it('is defined and renders', () => {
    expect(PromptVersionManager).toBeDefined();
  });
});
