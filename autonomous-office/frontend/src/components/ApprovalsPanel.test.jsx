import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ApprovalsPanel from './ApprovalsPanel';

describe('ApprovalsPanel', () => {
  it('is defined and renders', () => {
    expect(ApprovalsPanel).toBeDefined();
  });
});
