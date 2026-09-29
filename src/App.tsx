import React, { useState } from 'react';
import { SimulationMode, DefensesConfig, LogEntry } from './types';
import { PRESET_PAYLOADS } from './utils/cryptoUtils';
import { Navbar } from './components/Navbar';
import { NetworkTopology } from './components/NetworkTopology';
import { DefensePanel } from './components/DefensePanel';
import { EveControlPanel } from './components/EveControlPanel';
import { DiffieHellmanLab } from './components/DiffieHellmanLab';
import { AttackVectorsExplainer } from './components/AttackVectorsExplainer';
import { DefenseMatrix } from './components/DefenseMatrix';
import { ChallengeMissions } from './components/ChallengeMissions';
import { SuggestionsDrawer } from './components/SuggestionsDrawer';
import { Language, UI_TRANSLATIONS } from './translations';
import { Shield, Radio, Terminal, BookOpen, Lock, AlertTriangle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('th');
  const [activeTab, setActiveTab] = useState<'sandbox' | 'dh' | 'vectors' | 'defense' | 'challenges'>('sandbox');
  const t = UI_TRANSLATIONS[lang];
  
  // Attacker configuration
  const [mode, setMode] = useState<SimulationMode>('payload_tamper');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customPayload, setCustomPayload] = useState<string>(PRESET_PAYLOADS[0].content);
  const [customTamperedPayload, setCustomTamperedPayload] = useState<string>(PRESET_PAYLOADS[0].tamperedContent);

  // Defenses configuration
  const [defenses, setDefenses] = useState<DefensesConfig>({
    tls13: false,
    pkiCertValidation: false,
    hsts: false,
    certPinning: false,
    mtls: false,
    hmacIntegrity: false,
  });

  // Audit Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init_1',
      timestamp: new Date().toLocaleTimeString(),
      source: 'SYSTEM',
      type: 'info',
      message: 'MITM Interactive Simulation Lab initialized',
      details: 'Workstations: Alice (192.168.1.105), Eve (192.168.1.137), Bob (198.51.100.42)'
    }
  ]);

  const handleLogEvent = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 30)]);
  };

  const handleToggleDefense = (key: keyof DefensesConfig) => {
    setDefenses((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      handleLogEvent({
        source: 'DEFENSE',
        type: next[key] ? 'defense' : 'warning',
        message: `Defense altered: ${key} is now ${next[key] ? 'ENABLED' : 'DISABLED'}`,
      });
      return next;
    });
  };

  const handleSetPreset = (preset: 'none' | 'basic' | 'hardened' | 'zerotrust') => {
    if (preset === 'none') {
      setDefenses({
        tls13: false,
        pkiCertValidation: false,
        hsts: false,
        certPinning: false,
        mtls: false,
        hmacIntegrity: false,
      });
      handleLogEvent({
        source: 'DEFENSE',
        type: 'warning',
        message: 'Security preset applied: None (Vulnerable to all MITM vectors)',
      });
    } else if (preset === 'basic') {
      setDefenses({
        tls13: true,
        pkiCertValidation: true,
        hsts: false,
        certPinning: false,
        mtls: false,
        hmacIntegrity: false,
      });
      handleLogEvent({
        source: 'DEFENSE',
        type: 'defense',
        message: 'Security preset applied: Standard HTTPS (TLS 1.3 + PKI validation)',
      });
    } else if (preset === 'hardened') {
      setDefenses({
        tls13: true,
        pkiCertValidation: true,
        hsts: true,
        certPinning: true,
        mtls: false,
        hmacIntegrity: true,
      });
      handleLogEvent({
        source: 'DEFENSE',
        type: 'defense',
        message: 'Security preset applied: Hardened Web (TLS 1.3 + HSTS + Pinning + HMAC)',
      });
    } else if (preset === 'zerotrust') {
      setDefenses({
        tls13: true,
        pkiCertValidation: true,
        hsts: true,
        certPinning: true,
        mtls: true,
        hmacIntegrity: true,
      });
      handleLogEvent({
        source: 'DEFENSE',
        type: 'defense',
        message: 'Security preset applied: Zero Trust Architecture (Full mTLS & Strict Policies)',
      });
    }
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setCustomPayload(PRESET_PAYLOADS[index].content);
    setCustomTamperedPayload(PRESET_PAYLOADS[index].tamperedContent);
    handleLogEvent({
      source: 'SYSTEM',
      type: 'info',
      message: `Payload preset selected: "${PRESET_PAYLOADS[index].name}"`,
    });
  };

  const handleReset = () => {
    setDefenses({
      tls13: false,
      pkiCertValidation: false,
      hsts: false,
      certPinning: false,
      mtls: false,
      hmacIntegrity: false,
    });
    setMode('payload_tamper');
    setSelectedPresetIndex(0);
    setCustomPayload(PRESET_PAYLOADS[0].content);
    setCustomTamperedPayload(PRESET_PAYLOADS[0].tamperedContent);
    setLogs([
      {
        id: `reset_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'SYSTEM',
        type: 'info',
        message: 'Simulation reset to default state',
      }
    ]);
  };

  const handleQuickSim = () => {
    setActiveTab('sandbox');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        onQuickSim={handleQuickSim}
        hasActiveThreat={mode !== 'direct'}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Subtle Breadcrumb / Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {lang === 'th' ? 'โหมดห้องทดลอง:' : 'Laboratory Mode:'}
            </span>
            <span className="text-cyan-400 font-mono">
              {t.subtitles[activeTab]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${defenses.tls13 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {defenses.tls13 ? t.status.tlsReady : t.status.cleartext}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${mode === 'direct' ? 'bg-slate-400' : 'bg-rose-500 animate-pulse'}`} />
              {mode === 'direct' ? t.status.eveBypassed : t.status.eveActive}
            </span>
          </div>
        </div>

        {/* Tab 1: Live Interactive Topology Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="flex flex-col gap-6">
            <NetworkTopology
              mode={mode}
              defenses={defenses}
              payloadText={customPayload}
              tamperedPayloadText={customTamperedPayload}
              headers={PRESET_PAYLOADS[selectedPresetIndex]?.headers || {}}
              onLogEvent={handleLogEvent}
              logs={logs}
              lang={lang}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EveControlPanel
                mode={mode}
                setMode={(m) => {
                  setMode(m);
                  handleLogEvent({
                    source: 'EVE',
                    type: 'attack',
                    message: `Interception strategy changed to: ${m.replace('_', ' ').toUpperCase()}`,
                  });
                }}
                selectedPresetIndex={selectedPresetIndex}
                onSelectPreset={handleSelectPreset}
                customPayload={customPayload}
                setCustomPayload={setCustomPayload}
                customTamperedPayload={customTamperedPayload}
                setCustomTamperedPayload={setCustomTamperedPayload}
              />

              <DefensePanel
                defenses={defenses}
                onToggleDefense={handleToggleDefense}
                onSetPreset={handleSetPreset}
              />
            </div>

            {/* Suggestions & Next Recommended Actions */}
            <SuggestionsDrawer
              lang={lang}
              onApplyPreset={handleSetPreset}
              onSetMode={(m) => {
                setMode(m);
                handleLogEvent({
                  source: 'EVE',
                  type: 'attack',
                  message: `Interception strategy changed to: ${m.replace('_', ' ').toUpperCase()}`,
                });
              }}
              onSelectTab={setActiveTab}
              defenses={defenses}
              currentMode={mode}
            />
          </div>
        )}

        {/* Tab 2: Diffie-Hellman Key Exchange Breakdown */}
        {activeTab === 'dh' && <DiffieHellmanLab />}

        {/* Tab 3: Attack Vectors Explainer */}
        {activeTab === 'vectors' && <AttackVectorsExplainer />}

        {/* Tab 4: Defense Matrix & Production Configurations */}
        {activeTab === 'defense' && <DefenseMatrix />}

        {/* Tab 5: Hands-on Challenge Missions */}
        {activeTab === 'challenges' && <ChallengeMissions />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">MITM Lab</span>
            <span>·</span>
            <span>Interactive Cryptography & Transport Security Education</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>RFC 8446 (TLS 1.3)</span>
            <span>·</span>
            <span>RFC 6797 (HSTS)</span>
            <span>·</span>
            <span>RFC 6962 (Certificate Transparency)</span>
            <span>·</span>
            <span>IEEE 802.1X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
