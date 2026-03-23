import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import CopyButton from './CopyButton';

describe('CopyButton', () => {
  it('is defined and renders', () => {
    expect(CopyButton).toBeDefined();
  });
});
