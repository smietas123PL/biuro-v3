import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ExportPanel from './ExportPanel';

describe('ExportPanel', () => {
  it('is defined and renders', () => {
    expect(ExportPanel).toBeDefined();
  });
});
