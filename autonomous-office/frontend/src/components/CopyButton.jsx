import React, { useState } from 'react';
import Button from './ui/Button';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="secondary" onClick={handleCopy} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
      {copied ? '✅ Copied' : '📋 Copy'}
    </Button>
  );
}
