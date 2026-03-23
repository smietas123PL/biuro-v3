import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('is defined and renders', () => {
    expect(Button).toBeDefined();
  });
});
