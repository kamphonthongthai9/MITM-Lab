import React, { useState } from 'react';
import { modExp } from '../utils/cryptoUtils';
import { 
  Lock, 
  Unlock, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  HelpCircle, 
  Check, 
  X,
  FileSignature,
  Cpu
} from 'lucide-react';

export const DiffieHellmanLab: React.FC = () => {
  // Parameters
  const [prime, setPrime] = useState<number>(23);
  const [generator, setGenerator] = useState<number>(5);
  const [alicePrivate, setAlicePrivate] = useState<number>(6);
  const [bobPrivate, setBobPrivate] = useState<number>(15);
  const [evePrivate, setEvePrivate] = useState<number>(9);

  // Mode: unauthenticated vs authenticated
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // Message test
  const [testMessage, setTestMessage] = useState<string>('TRANSFER_APPROVED:$10,000');
  const [tamperedMessage, setTamperedMessage] = useState<string>('TRANSFER_APPROVED:$1,000,000_TO_EVE');
  const [handshakeStep, setHandshakeStep] = useState<number>(1);

  // Calculations
  // Alice public A = g^a mod p
  const alicePublic = modExp(generator, alicePrivate, prime);
  // Bob public B = g^b mod p
  const bobPublic = modExp(generator, bobPrivate, prime);
  // Eve public E = g^e mod p
  const evePublic = modExp(generator, evePrivate, prime);

  // Normal without MITM:
  // Key_AB = B^a mod p = A^b mod p = g^(ab) mod p
  const directKey = modExp(bobPublic, alicePrivate, prime);

  // MITM case:
  // Alice receives Eve's E instead of B: Key_AE = E^a mod p = g^(ea) mod p
  const keyAliceEve = modExp(evePublic, alicePrivate, prime);
  // Bob receives Eve's E instead of A: Key_EB = E^b mod p = g^(eb) mod p
  const keyEveBob = modExp(evePublic, bobPrivate, prime);

  // Eve calculates:
  // Eve receives Alice's A: Key_EA = A^e mod p
  const eveKeyWithAlice = modExp(alicePublic, evePrivate, prime);
  // Eve receives Bob's B: Key_EB = B^e mod p
  const eveKeyWithBob = modExp(bobPublic, evePrivate, prime);

  return (
    <div className="flex flex-col gap-6">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Diffie-Hellman Key Exchange & The Interception Paradox
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Diffie-Hellman (1976) allows two parties to establish a shared secret over an insecure medium. 
              However, <strong>pure unauthenticated DH cannot verify the identity of the other endpoint</strong>. 
              An attacker sitting in the middle can perform two separate handshakes simultaneously!
            </p>
          </div>

          {/* Authentication Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-start lg:self-auto">
            <button
              onClick={() => setAuthenticated(false)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                !authenticated
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unauthenticated DH (Vulnerable)</span>
            </button>
            <button
              onClick={() => setAuthenticated(true)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                authenticated
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Signed ECDHE (TLS 1.3 / Protected)</span>
            </button>
          </div>
        </div>

        {/* Mathematical Parameter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Public Prime (p)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-cyan-300">{prime}</span>
              <div className="flex gap-1">
                {[23, 47, 97].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPrime(val)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      prime === val ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Public Generator (g)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-cyan-300">{generator}</span>
              <div className="flex gap-1">
                {[5, 3, 2].map((val) => (
                  <button
                    key={val}
                    onClick={() => setGenerator(val)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      generator === val ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Alice Secret (a)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-cyan-300">{alicePrivate}</span>
              <input
                type="range"
                min="2"
                max={prime - 2}
                value={alicePrivate}
                onChange={(e) => setAlicePrivate(Number(e.target.value))}
                className="w-16 accent-cyan-400"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Eve Secret (e)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-rose-400">{evePrivate}</span>
              <input
                type="range"
                min="2"
                max={prime - 2}
                value={evePrivate}
                onChange={(e) => setEvePrivate(Number(e.target.value))}
                className="w-16 accent-rose-400"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Bob Secret (b)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-emerald-300">{bobPrivate}</span>
              <input
                type="range"
                min="2"
                max={prime - 2}
                value={bobPrivate}
                onChange={(e) => setBobPrivate(Number(e.target.value))}
                className="w-16 accent-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Tri-Party Mathematical Handshake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Alice */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="font-bold text-white text-sm">Alice (Client)</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Secret: a = {alicePrivate}</span>
          </div>

          {/* Step 1: Compute public key */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">1. Compute Public Value (A)</span>
            <div className="font-mono text-cyan-300">
              A = g<sup>a</sup> mod p = {generator}<sup>{alicePrivate}</sup> mod {prime}
            </div>
            <div className="text-sm font-bold font-mono text-cyan-200 mt-1">
              A = {alicePublic}
            </div>
          </div>

          {/* Step 2: What Alice receives */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">2. Received Public Value</span>
            {authenticated ? (
              <div className="flex flex-col gap-1">
                <div className="text-emerald-300 font-mono">
                  Received B = {bobPublic}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Valid RSA/ECDSA Cert Signature
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="text-rose-300 font-mono">
                  Received E = {evePublic} (Believes it is Bob's B)
                </div>
                <div className="text-[10px] text-rose-400 font-mono">
                  ⚠ Unauthenticated value intercepted!
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Derived Shared Key */}
          <div className={`p-3 rounded border text-xs flex flex-col gap-1 ${
            authenticated
              ? 'bg-emerald-950/40 border-emerald-800'
              : 'bg-rose-950/40 border-rose-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-300">3. Alice's Derived Key</span>
            {authenticated ? (
              <div>
                <div className="font-mono text-xs text-slate-300">
                  K = B<sup>a</sup> mod p = {bobPublic}<sup>{alicePrivate}</sup> mod {prime}
                </div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-1">
                  Key: K<sub>AB</sub> = {directKey}
                </div>
                <span className="text-[10px] text-emerald-400">Directly shared with Bob only</span>
              </div>
            ) : (
              <div>
                <div className="font-mono text-xs text-slate-300">
                  K = E<sup>a</sup> mod p = {evePublic}<sup>{alicePrivate}</sup> mod {prime}
                </div>
                <div className="text-base font-bold font-mono text-rose-300 mt-1">
                  Key: K<sub>AE</sub> = {keyAliceEve}
                </div>
                <span className="text-[10px] text-rose-400">Shared with EVE, not Bob!</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Eve (The Interceptor) */}
        <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-bold text-rose-300 text-sm">Eve (The Man-in-the-Middle)</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400">Secret: e = {evePrivate}</span>
          </div>

          {authenticated ? (
            <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs flex flex-col gap-3 my-auto text-center">
              <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
              <div>
                <span className="font-bold text-slate-200 block text-sm">Handshake Interception Blocked!</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Bob signed his ephemeral public key (B = {bobPublic}) with his private key <code>Cert_Bob.key</code>. 
                  Eve cannot substitute her own key E without forging Bob's digital signature. 
                  Alice rejects any tampered key immediately!
                </p>
              </div>
              <div className="p-2 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-300 text-[10px] font-mono">
                RFC 8446 TLS 1.3: CertificateVerify Signature Validated
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Eve replaces keys */}
              <div className="bg-slate-950 p-3 rounded border border-rose-900/40 text-xs flex flex-col gap-1">
                <span className="text-[11px] text-rose-300 font-semibold">1. Key Replacement Attack</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Eve drops Alice's A ({alicePublic}) and Bob's B ({bobPublic}). 
                  Sends her own <strong>E = {evePublic}</strong> to both!
                </p>
                <div className="text-xs font-mono text-rose-400 mt-1">
                  E = g<sup>e</sup> mod p = {generator}<sup>{evePrivate}</sup> mod {prime} = {evePublic}
                </div>
              </div>

              {/* Step 2: Eve derives dual keys */}
              <div className="bg-slate-950 p-3 rounded border border-rose-900/40 text-xs flex flex-col gap-2">
                <span className="text-[11px] text-rose-300 font-semibold">2. Eve Derives BOTH Secret Keys!</span>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] flex justify-between items-center">
                  <span className="text-cyan-300">With Alice (K<sub>AE</sub>):</span>
                  <span className="font-bold text-white">{eveKeyWithAlice}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] flex justify-between items-center">
                  <span className="text-emerald-300">With Bob (K<sub>EB</sub>):</span>
                  <span className="font-bold text-white">{eveKeyWithBob}</span>
                </div>
              </div>

              {/* Step 3: Decrypt & Re-encrypt loop */}
              <div className="bg-rose-950/40 border border-rose-800 p-3 rounded text-xs flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-rose-300">3. Full Decryption & Tampering Proxy</span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Alice encrypts with <strong>{keyAliceEve}</strong> &rarr; Eve decrypts with <strong>{eveKeyWithAlice}</strong> &rarr; 
                  Eve modifies data &rarr; Eve re-encrypts with <strong>{eveKeyWithBob}</strong> &rarr; Bob decrypts with <strong>{keyEveBob}</strong>!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Bob */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-bold text-white text-sm">Bob (Server)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Secret: b = {bobPrivate}</span>
          </div>

          {/* Step 1: Compute public key */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">1. Compute Public Value (B)</span>
            <div className="font-mono text-emerald-300">
              B = g<sup>b</sup> mod p = {generator}<sup>{bobPrivate}</sup> mod {prime}
            </div>
            <div className="text-sm font-bold font-mono text-emerald-200 mt-1">
              B = {bobPublic}
            </div>
          </div>

          {/* Step 2: What Bob receives */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">2. Received Public Value</span>
            {authenticated ? (
              <div className="flex flex-col gap-1">
                <div className="text-cyan-300 font-mono">
                  Received A = {alicePublic}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Mutual TLS / Direct Channel Verified
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="text-rose-300 font-mono">
                  Received E = {evePublic} (Believes it is Alice's A)
                </div>
                <div className="text-[10px] text-rose-400 font-mono">
                  ⚠ Unauthenticated value received!
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Derived Shared Key */}
          <div className={`p-3 rounded border text-xs flex flex-col gap-1 ${
            authenticated
              ? 'bg-emerald-950/40 border-emerald-800'
              : 'bg-rose-950/40 border-rose-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-300">3. Bob's Derived Key</span>
            {authenticated ? (
              <div>
                <div className="font-mono text-xs text-slate-300">
                  K = A<sup>b</sup> mod p = {alicePublic}<sup>{bobPrivate}</sup> mod {prime}
                </div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-1">
                  Key: K<sub>AB</sub> = {directKey}
                </div>
                <span className="text-[10px] text-emerald-400">Identical to Alice's key ({directKey})</span>
              </div>
            ) : (
              <div>
                <div className="font-mono text-xs text-slate-300">
                  K = E<sup>b</sup> mod p = {evePublic}<sup>{bobPrivate}</sup> mod {prime}
                </div>
                <div className="text-base font-bold font-mono text-rose-300 mt-1">
                  Key: K<sub>EB</sub> = {keyEveBob}
                </div>
                <span className="text-[10px] text-rose-400">Identical to Eve's second key ({keyEveBob})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Practical Demonstration: Message Payload Flow */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Data Transmission & Decryption Simulation
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {authenticated ? 'Protected by Digital Signatures' : 'Zero Authentication Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-cyan-300">Alice Sends:</span>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="text-[10px] font-mono text-slate-400">
              Encrypted with Key {authenticated ? directKey : keyAliceEve}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/50 flex flex-col gap-2">
            <span className="text-xs font-bold text-rose-400">
              {authenticated ? 'Eve Interception Status:' : 'Eve Intercepts & Re-Encrypts:'}
            </span>
            {authenticated ? (
              <div className="text-xs text-slate-400 p-2 font-mono bg-slate-900 rounded">
                Cannot decrypt or forge signature. Packet forwarded untouched or dropped.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={tamperedMessage}
                  onChange={(e) => setTamperedMessage(e.target.value)}
                  className="bg-slate-900 border border-rose-900 rounded px-2.5 py-1.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
                <div className="text-[10px] font-mono text-rose-400">
                  Decrypted with Key {eveKeyWithAlice} &rarr; Re-encrypted with Key {eveKeyWithBob}
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-emerald-300">Bob Decrypts:</span>
            <div className={`p-2 rounded text-xs font-mono ${
              authenticated 
                ? 'bg-slate-900 text-emerald-300 border border-emerald-900/40' 
                : 'bg-rose-950/40 text-rose-300 border border-rose-800'
            }`}>
              {authenticated ? testMessage : tamperedMessage}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {authenticated
                ? `Decrypted with Key ${directKey} (Legitimate)`
                : `Decrypted with Key ${keyEveBob} (Tampered payload accepted!)`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
