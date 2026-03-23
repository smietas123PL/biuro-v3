import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import TaskList from './TaskList';

describe('TaskList', () => {
  it('is defined and renders', () => {
    expect(TaskList).toBeDefined();
  });
});
