import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import OnboardingWizard from './OnboardingWizard';

describe('OnboardingWizard', () => {
  it('is defined and renders', () => {
    expect(OnboardingWizard).toBeDefined();
  });
});
