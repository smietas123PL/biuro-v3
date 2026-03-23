import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import DemoToggle from './DemoToggle';

describe('DemoToggle', () => {
  it('is defined and renders', () => {
    expect(DemoToggle).toBeDefined();
  });
});
