import React from 'react';
import { DefensesConfig } from '../types';
import { Shield, Lock, CheckCircle2, XCircle, Info } from 'lucide-react';

interface DefensePanelProps {
  defenses: DefensesConfig;
  onToggleDefense: (key: keyof DefensesConfig) => void;
  onSetPreset: (preset: 'none' | 'basic' | 'hardened' | 'zerotrust') => void;
}

export const DefensePanel: React.FC<DefensePanelProps> = ({
  defenses,
  onToggleDefense,
  onSetPreset,
}) => {
  const defenseItems: {
    key: keyof DefensesConfig;
    title: string;
    layer: string;
    description: string;
    stops: string;
  }[] = [
    {
      key: 'tls13',
      title: 'TLS 1.3 Protocol Encryption',
      layer: 'Layer 7 / Transport Security',
      description: 'Encrypts payloads with AES-256-GCM or ChaCha20-Poly1305. Nonce-based sequence numbers prevent packet replay.',
      stops: 'Stops: Plaintext Sniffing, Arbitrary Tampering, Simple Replay'
    },
    {
      key: 'pkiCertValidation',
      title: 'PKI & X.509 Certificate Chain',
      layer: 'Trust Store / Cryptographic Identity',
      description: 'Alice verifies Bob’s public key certificate against root Certificate Authorities (CA) using digital signatures.',
      stops: 'Stops: Untrusted Interception Proxies, Self-Signed Fake Servers'
    },
    {
      key: 'hsts',
      title: 'HSTS (HTTP Strict Transport Security)',
      layer: 'Browser Security Policy',
      description: 'Forces browser to ONLY communicate over HTTPS via Strict-Transport-Security header and Preload lists.',
      stops: 'Stops: SSL Stripping, HTTP Downgrade Attacks'
    },
    {
      key: 'certPinning',
      title: 'Certificate / Public Key Pinning',
      layer: 'Application Pinning Layer',
      description: 'Hardcodes Bob’s exact public key hash into Alice’s client, rejecting even rogue CAs who issue fraudulent certs.',
      stops: 'Stops: Rogue CAs, Compromised Root Certificates, DigiNotar-style attacks'
    },
    {
      key: 'mtls',
      title: 'Mutual TLS (mTLS / Client Certificates)',
      layer: 'Bidirectional Cryptographic Auth',
      description: 'Both client and server present X.509 certificates. The server will reject any client missing a valid internal signature.',
      stops: 'Stops: Impersonation of Alice, Unauthorized Proxy Injection'
    },
    {
      key: 'hmacIntegrity',
      title: 'HMAC / Cryptographic Signatures',
      layer: 'Payload Integrity Layer',
      description: 'Appends a keyed cryptographic hash (HMAC-SHA256) or digital signature. Any single bit altered causes validation to fail.',
      stops: 'Stops: In-Transit Data Tampering & Corruption'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
            Cryptographic Defense Controls
          </h2>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 hidden sm:inline">Presets:</span>
          <button
            onClick={() => onSetPreset('none')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            None (Vulnerable)
          </button>
          <button
            onClick={() => onSetPreset('basic')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Standard HTTPS
          </button>
          <button
            onClick={() => onSetPreset('hardened')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
          >
            Hardened Web
          </button>
          <button
            onClick={() => onSetPreset('zerotrust')}
            className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
          >
            Zero Trust (mTLS)
          </button>
        </div>
      </div>

      {/* Grid of Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defenseItems.map((item) => {
          const isEnabled = defenses[item.key];
          return (
            <div
              key={item.key}
              onClick={() => onToggleDefense(item.key)}
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3 ${
                isEnabled
                  ? 'bg-slate-800/80 border-cyan-500/50 shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-80'
              }`}
            >
              {/* Checkbox Icon */}
              <div className="mt-0.5 shrink-0">
                {isEnabled ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {item.title}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isEnabled
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {isEnabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {item.layer}
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="text-[10px] text-emerald-400 font-mono mt-1.5">
                  {item.stops}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
