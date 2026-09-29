import React from 'react';
import { SimulationMode } from '../types';
import { Radio, Eye, Edit3, ShieldOff, Trash2, Repeat, ArrowRightLeft } from 'lucide-react';
import { PRESET_PAYLOADS } from '../utils/cryptoUtils';

interface EveControlPanelProps {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  selectedPresetIndex: number;
  onSelectPreset: (index: number) => void;
  customPayload: string;
  setCustomPayload: (val: string) => void;
  customTamperedPayload: string;
  setCustomTamperedPayload: (val: string) => void;
}

export const EveControlPanel: React.FC<EveControlPanelProps> = ({
  mode,
  setMode,
  selectedPresetIndex,
  onSelectPreset,
  customPayload,
  setCustomPayload,
  customTamperedPayload,
  setCustomTamperedPayload,
}) => {
  const modes: {
    id: SimulationMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
    dangerLevel: 'low' | 'med' | 'high' | 'critical';
  }[] = [
    {
      id: 'direct',
      label: 'Direct Channel (No Interception)',
      icon: <ArrowRightLeft className="w-4 h-4 text-emerald-400" />,
      desc: 'Normal network routing. Eve does not alter or intercept traffic.',
      dangerLevel: 'low',
    },
    {
      id: 'passive_sniff',
      label: 'Passive Eavesdropping',
      icon: <Eye className="w-4 h-4 text-amber-400" />,
      desc: 'Eve sniffs network packets on the wire without altering payloads.',
      dangerLevel: 'med',
    },
    {
      id: 'payload_tamper',
      label: 'Active Payload Tampering',
      icon: <Edit3 className="w-4 h-4 text-rose-400" />,
      desc: 'Eve intercepts data, modifies variables/recipients, and retransmits.',
      dangerLevel: 'critical',
    },
    {
      id: 'ssl_strip',
      label: 'SSL Stripping (Downgrade)',
      icon: <ShieldOff className="w-4 h-4 text-amber-400" />,
      desc: 'Eve forces Alice onto plain HTTP while maintaining HTTPS to Bob.',
      dangerLevel: 'high',
    },
    {
      id: 'replay_attack',
      label: 'Transaction Replay Attack',
      icon: <Repeat className="w-4 h-4 text-purple-400" />,
      desc: 'Eve captures a valid signed packet and resends it repeatedly.',
      dangerLevel: 'high',
    },
    {
      id: 'drop_packet',
      label: 'Blackhole / DoS (Drop Packet)',
      icon: <Trash2 className="w-4 h-4 text-slate-400" />,
      desc: 'Eve drops packets silently, causing complete communication failure.',
      dangerLevel: 'med',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
            Interception & Attack Vector Controls (Eve)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Position: Man-in-the-Middle (In-Line Proxy)
        </span>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {modes.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-rose-950/30 border-rose-500/60 shadow-sm shadow-rose-950/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                {isActive && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Payload Preset Selector & Live Modification */}
      <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Select Transmission Preset:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PAYLOADS.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => onSelectPreset(idx)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  selectedPresetIndex === idx
                    ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Payload Viewer when in Tamper Mode */}
        {mode === 'payload_tamper' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            {/* Original Payload (Alice) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-400">Alice's Original Payload</span>
                <span className="font-mono text-[10px]">Read-Only Source</span>
              </div>
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Eve's Tampered Payload */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-rose-400">Eve's Injected / Tampered Modification</span>
                <span className="font-mono text-[10px] text-rose-400">Editable In-Transit</span>
              </div>
              <textarea
                value={customTamperedPayload}
                onChange={(e) => setCustomTamperedPayload(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-rose-900/60 rounded p-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
