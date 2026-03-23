import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function OnboardingWizard({ onComplete }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-modal)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card>
        <h2>Welcome to Autonomiczne Biuro</h2>
        <p>Let's set up your first workspace.</p>
        <Button onClick={onComplete}>Get Started</Button>
      </Card>
    </div>
  );
}
