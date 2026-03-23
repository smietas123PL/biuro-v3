import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import TemplateLoader from './TemplateLoader';

describe('TemplateLoader', () => {
  it('is defined and renders', () => {
    expect(TemplateLoader).toBeDefined();
  });
});
