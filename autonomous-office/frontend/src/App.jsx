import React, { useState, useEffect } from 'react';
import ThemeToggle from './components/ui/ThemeToggle';
import useTheme from './hooks/useTheme';
import useHotkeys from './hooks/useHotkeys';

// Tabs
import AgentCard from './components/AgentCard';
import StatusDashboard from './components/StatusDashboard';
import CostDashboard from './components/CostDashboard';
import AuditLog from './components/AuditLog';
import ApiKeysPanel from './components/ApiKeysPanel';
import ApprovalRules from './components/ApprovalRules';
import ApprovalsPanel from './components/ApprovalsPanel';
import CommandPalette from './components/CommandPalette';
import HotkeyCheatSheet from './components/HotkeyCheatSheet';
import ExportPanel from './components/ExportPanel';
import TaskQueuePanel from './components/TaskQueuePanel';
import RateLimitPanel from './components/RateLimitPanel';
import DependencyGraph from './components/DependencyGraph';
import OnboardingWizard from './components/OnboardingWizard';
import DemoToggle from './components/DemoToggle';
import CompanySelector from './components/CompanySelector';
import TemplateLoader from './components/TemplateLoader';

function App() {
  const [activeTab, setActiveTab] = useState('status');
  const [showPalette, setShowPalette] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // MVP: Sprawdzamy czy to pierwsze uruchomienie (Onboarding)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboardingDone');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingDone', 'true');
    setShowOnboarding(false);
    setActiveTab('settings'); // Przekieruj usera do ustawień API Keys po onboardingu
  };

  useHotkeys({
    'd': toggleTheme,
    '1': () => setActiveTab('agents'),
    '2': () => setActiveTab('status'),
    '3': () => setActiveTab('finance'),
    '4': () => setActiveTab('approvals'),
    '5': () => setActiveTab('log'),
    '6': () => setActiveTab('settings'),
    '?': () => setShowCheatSheet(prev => !prev),
    'k': (e) => { if(e.ctrlKey || e.metaKey) setShowPalette(true); },
    'escape': () => { setShowPalette(false); setShowCheatSheet(false); }
  });

  return (
    <div className="app-container" data-theme={theme}>
      {showOnboarding && <OnboardingWizard onComplete={completeOnboarding} />}
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} setTab={setActiveTab} />}
      {showCheatSheet && <HotkeyCheatSheet />}

      <header className="app-header">
        <h1 style={{ display: 'flex', alignItems: 'center' }}>
          Autonomiczne Biuro
          <DemoToggle />
          <CompanySelector />
        </h1>
        <nav>
          <button onClick={() => setActiveTab('agents')} className={activeTab === 'agents' ? 'active' : ''}>Agents</button>
          <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'active' : ''}>Status</button>
          <button onClick={() => setActiveTab('finance')} className={activeTab === 'finance' ? 'active' : ''}>Finance</button>
          <button onClick={() => setActiveTab('approvals')} className={activeTab === 'approvals' ? 'active' : ''}>Approvals</button>
          <button onClick={() => setActiveTab('log')} className={activeTab === 'log' ? 'active' : ''}>Log</button>
          <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</button>
        </nav>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <main className="app-content">
        {activeTab === 'agents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <AgentCard />
            <DependencyGraph />
          </div>
        )}
        {activeTab === 'status' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <StatusDashboard />
            <TemplateLoader />
            <TaskQueuePanel />
          </div>
        )}
        {activeTab === 'finance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <CostDashboard />
            <RateLimitPanel />
          </div>
        )}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <TemplateLoader />
            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              <div style={{ flex: 1 }}><ApprovalsPanel /></div>
              <div style={{ flex: 1 }}><ApprovalRules /></div>
            </div>
          </div>
        )}
        {activeTab === 'log' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <AuditLog />
            <ExportPanel />
          </div>
        )}
        {activeTab === 'settings' && <ApiKeysPanel />}
      </main>
    </div>
  );
}

export default App;
