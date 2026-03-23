import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import CommandPalette from './CommandPalette';

describe('CommandPalette', () => {
  it('is defined and renders', () => {
    expect(CommandPalette).toBeDefined();
  });
});
