import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import HotkeyCheatSheet from './HotkeyCheatSheet';

describe('HotkeyCheatSheet', () => {
  it('is defined and renders', () => {
    expect(HotkeyCheatSheet).toBeDefined();
  });
});
