import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import AddAgentModal from './AddAgentModal';

describe('AddAgentModal', () => {
  it('is defined and renders', () => {
    expect(AddAgentModal).toBeDefined();
  });
});
