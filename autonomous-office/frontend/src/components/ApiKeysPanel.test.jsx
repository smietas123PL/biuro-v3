import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ApiKeysPanel from './ApiKeysPanel';

describe('ApiKeysPanel', () => {
  it('is defined and renders', () => {
    expect(ApiKeysPanel).toBeDefined();
  });
});
