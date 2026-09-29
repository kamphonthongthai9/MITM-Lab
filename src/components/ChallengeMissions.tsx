import React, { useState } from 'react';
import { ChallengeMission, DefensesConfig } from '../types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CHALLENGE_MISSIONS: ChallengeMission[] = [
  {
    id: 'mission_1',
    title: 'Mission 1: The High-Stakes Wire Heist',
    category: 'Integrity & Confidentiality',
    difficulty: 'Beginner',
    description: 'A bank employee is sending an unencrypted HTTP wire transfer. Eve is modifying the payload in transit, redirecting $50,000 to an offshore account.',
    scenario: 'Analyze the attack vector. Enable the cryptographic defense(s) that ensure both end-to-end payload confidentiality and cryptographic integrity verification (AEAD / HMAC).',
    initialDefenses: {
      tls13: false,
      pkiCertValidation: false,
      hsts: false,
      certPinning: false,
      mtls: false,
      hmacIntegrity: false,
    },
    targetAttack: 'payload_tamper',
    requiredDefenses: ['tls13'],
    explanation: 'TLS 1.3 utilizes Authenticated Encryption with Associated Data (AEAD, e.g. AES-256-GCM or ChaCha20-Poly1305). Any attempt by Eve to alter ciphertext bits invalidates the authentication tag, triggering BAD_RECORD_MAC and dropping the packet.',
    realWorldExample: 'Financial institutions without transport encryption historically suffered from automated transaction tampering on open local subnets.'
  },
  {
    id: 'mission_2',
    title: 'Mission 2: Airport Wi-Fi SSL Stripping',
    category: 'Downgrade Prevention',
    difficulty: 'Intermediate',
    description: 'An executive on airport public Wi-Fi attempts to connect to corporate webmail. Eve intercepts the initial HTTP connection and drops the HTTPS redirect.',
    scenario: 'Eve proxies the connection to the server over HTTPS while keeping Alice on cleartext HTTP. Standard HTTPS redirects fail because Alice never enters HTTPS.',
    initialDefenses: {
      tls13: true,
      pkiCertValidation: true,
      hsts: false,
      certPinning: false,
      mtls: false,
      hmacIntegrity: false,
    },
    targetAttack: 'ssl_strip',
    requiredDefenses: ['hsts'],
    explanation: 'HSTS (HTTP Strict Transport Security) with browser preloading instructs the browser to NEVER issue an unencrypted HTTP request for the domain. The browser internally rewrites http:// to https:// prior to transmission.',
    realWorldExample: 'Moxie Marlinspike’s sslstrip tool made headlines in 2009 by harvesting thousands of credentials at security conferences.'
  },
  {
    id: 'mission_3',
    title: 'Mission 3: The Compromised Certificate Authority',
    category: 'PKI Hardening',
    difficulty: 'Advanced',
    description: 'A nation-state adversary hacked an intermediate Certificate Authority and minted a validly-signed fraudulent certificate for *.corpbank.com.',
    scenario: 'Alice’s operating system trusts the CA, so standard PKI certificate validation gives a false sense of security. How can the mobile banking app protect its users?',
    initialDefenses: {
      tls13: true,
      pkiCertValidation: true,
      hsts: true,
      certPinning: false,
      mtls: false,
      hmacIntegrity: false,
    },
    targetAttack: 'payload_tamper',
    requiredDefenses: ['certPinning'],
    explanation: 'Certificate and Public Key Pinning (HPKP / SPKI hashing) bypasses reliance on third-party CAs by requiring the server public key to match a predefined hash embedded in the mobile binary.',
    realWorldExample: 'The 2011 DigiNotar hack resulted in hundreds of forged Google certificates that passed standard browser CA trust chains.'
  },
  {
    id: 'mission_4',
    title: 'Mission 4: Zero-Trust Microservice Interception',
    category: 'Bidirectional Authentication',
    difficulty: 'Advanced',
    description: 'In an internal cloud cluster, a compromised container attempts to inject fraudulent API commands into the payment microservice.',
    scenario: 'The server needs absolute cryptographic assurance that only authenticated, authorized internal client microservices can initiate transactions.',
    initialDefenses: {
      tls13: true,
      pkiCertValidation: true,
      hsts: true,
      certPinning: false,
      mtls: false,
      hmacIntegrity: false,
    },
    targetAttack: 'payload_tamper',
    requiredDefenses: ['mtls'],
    explanation: 'Mutual TLS (mTLS) requires both the client and server to exchange and cryptographically verify X.509 certificates during handshake, preventing unauthorized or spoofed service connections.',
    realWorldExample: 'Service meshes like Istio, Linkerd, and modern Kubernetes enterprise architectures enforce mTLS by default for zero-trust compliance.'
  }
];

export const ChallengeMissions: React.FC = () => {
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(0);
  const currentMission = CHALLENGE_MISSIONS[selectedMissionIndex];

  // User's configured defenses for this mission
  const [userDefenses, setUserDefenses] = useState<DefensesConfig>(currentMission.initialDefenses);
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    title: string;
    details: string;
  } | null>(null);

  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});

  const handleSelectMission = (idx: number) => {
    setSelectedMissionIndex(idx);
    setUserDefenses(CHALLENGE_MISSIONS[idx].initialDefenses);
    setTestResult(null);
  };

  const toggleDefense = (key: keyof DefensesConfig) => {
    setUserDefenses((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const runChallengeTest = () => {
    // Check if all required defenses are present
    const missing = currentMission.requiredDefenses.filter((req) => !userDefenses[req]);
    
    if (missing.length === 0) {
      setTestResult({
        passed: true,
        title: 'Mission Accomplished! Threat Neutralized',
        details: currentMission.explanation,
      });
      setCompletedMissions((prev) => ({
        ...prev,
        [currentMission.id]: true,
      }));
    } else {
      setTestResult({
        passed: false,
        title: 'Vulnerability Exploited! MITM Attack Succeeded',
        details: `The current defense configuration is missing critical protection against this vector. Review the scenario and activate the required defense layer(s).`,
      });
    }
  };

  const handleResetCurrent = () => {
    setUserDefenses(currentMission.initialDefenses);
    setTestResult(null);
  };

  const completedCount = Object.keys(completedMissions).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Defense Challenge Missions
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test your cybersecurity defensive engineering skills. Analyze real-world MITM attack scenarios, 
            diagnose vulnerabilities, and harden the system by toggling the proper cryptographic controls.
          </p>
        </div>

        {/* Score & Progress */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 self-start md:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Labs Completed</div>
            <div className="text-base font-bold font-mono text-cyan-400">
              {completedCount} / {CHALLENGE_MISSIONS.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-bold text-xs text-cyan-300">
            {Math.round((completedCount / CHALLENGE_MISSIONS.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHALLENGE_MISSIONS.map((m, idx) => {
          const isSelected = selectedMissionIndex === idx;
          const isCompleted = !!completedMissions[m.id];
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMission(idx)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    m.difficulty === 'Beginner'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : m.difficulty === 'Intermediate'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {m.difficulty}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{m.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono">{m.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mission Workspace */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {currentMission.title}
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Target Attack Vector: {currentMission.targetAttack.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCurrent}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Reset Mission
            </button>
            <button
              onClick={runChallengeTest}
              className="px-4 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-950"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Defense Test</span>
            </button>
          </div>
        </div>

        {/* Scenario Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                Mission Brief & Attack Scenario
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentMission.description}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {currentMission.scenario}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                Historical Context
              </span>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {currentMission.realWorldExample}
              </p>
            </div>
          </div>

          {/* Defense Selector for Mission */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-200 uppercase font-mono">
              Configure Defense Matrix for This Mission:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  { key: 'tls13', label: 'TLS 1.3 Encryption' },
                  { key: 'pkiCertValidation', label: 'PKI Certificate Chain' },
                  { key: 'hsts', label: 'HSTS & Preloading' },
                  { key: 'certPinning', label: 'Certificate Pinning' },
                  { key: 'mtls', label: 'Mutual TLS (mTLS)' },
                  { key: 'hmacIntegrity', label: 'HMAC Data Integrity' },
                ] as const
              ).map((def) => {
                const isActive = userDefenses[def.key];
                return (
                  <button
                    key={def.key}
                    onClick={() => toggleDefense(def.key)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{def.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-cyan-900 text-cyan-200 font-bold' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {isActive ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Verification Test Result Banner */}
        {testResult && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            testResult.passed
              ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/80 text-rose-200'
          }`}>
            <div className="mt-0.5 shrink-0">
              {testResult.passed ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">
                {testResult.title}
              </h4>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                {testResult.details}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
