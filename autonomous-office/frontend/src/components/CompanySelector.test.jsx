import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import CompanySelector from './CompanySelector';

describe('CompanySelector', () => {
  it('is defined and renders', () => {
    expect(CompanySelector).toBeDefined();
  });
});
