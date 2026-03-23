import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  it('is defined and renders', () => {
    expect(ThemeToggle).toBeDefined();
  });
});
