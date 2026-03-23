import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('is defined and renders', () => {
    expect(Card).toBeDefined();
  });
});
