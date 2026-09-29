import React, { useState } from 'react';
import { 
  Network, 
  ShieldOff, 
  Award, 
  Globe, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface VectorDetail {
  id: string;
  title: string;
  layer: string;
  icon: React.ReactNode;
  summary: string;
  mechanism: string;
  realWorldIncident: string;
  defenseTactics: string[];
  interactiveDemoType: 'arp' | 'sslstrip' | 'rogueca' | 'dns';
}

export const AttackVectorsExplainer: React.FC = () => {
  const [selectedVectorId, setSelectedVectorId] = useState<string>('arp');

  // Interactive states for specific vector demos
  const [arpPoisoned, setArpPoisoned] = useState<boolean>(false);
  const [hstsEnabled, setHstsEnabled] = useState<boolean>(false);
  const [ctVerificationEnabled, setCtVerificationEnabled] = useState<boolean>(false);

  const vectors: VectorDetail[] = [
    {
      id: 'arp',
      title: 'ARP Cache Poisoning (Layer 2 / Local Network)',
      layer: 'Data Link Layer (OSI Layer 2)',
      icon: <Network className="w-5 h-5 text-rose-400" />,
      summary: 'Manipulating the Address Resolution Protocol on a local Ethernet or Wi-Fi network to redirect traffic through an attacker node.',
      mechanism: 'ARP lacks authentication. Any node on a subnet can broadcast unsolicited (gratuitous) ARP replies claiming that a target IP address belongs to the attacker’s MAC address. Once the victim’s ARP cache is overwritten, all outbound frames are delivered straight to the attacker’s network interface.',
      realWorldIncident: 'Commonly executed using tools like Ettercap or Bettercap on open public Wi-Fi networks and corporate LANs lacking port security.',
      defenseTactics: [
        'Dynamic ARP Inspection (DAI) on managed switches using DHCP snooping binding databases',
        '802.1X Network Access Control (NAC) requiring device cryptographic authentication',
        'Static ARP mappings for critical default gateways'
      ],
      interactiveDemoType: 'arp'
    },
    {
      id: 'sslstrip',
      title: 'SSL Stripping & Downgrade Attacks',
      layer: 'Application Layer (HTTP/HTTPS)',
      icon: <ShieldOff className="w-5 h-5 text-amber-400" />,
      summary: 'Intercepting the initial insecure HTTP request or 302 redirect and transparently downgrading client communication to unencrypted plaintext.',
      mechanism: 'Users rarely type "https://". Instead, they type "bank.com", causing an initial HTTP connection. The server normally replies with "302 Found: Location: https://bank.com". An interceptor intercepts this redirect, opens an HTTPS session with the server, but delivers plain unencrypted HTTP to the victim browser while rewriting all secure links.',
      realWorldIncident: 'Demonstrated by Moxie Marlinspike at Black Hat 2009. Automated tools like sslstrip rendered standard HTTPS redirects ineffective before HSTS.',
      defenseTactics: [
        'HTTP Strict Transport Security (HSTS) with max-age >= 31536000 and includeSubDomains',
        'HSTS Preload Lists baked into Chrome, Firefox, Safari, and Edge binaries',
        'Automatic HTTPS upgrades and DNS HTTPS resource records (SVCB/HTTPS)'
      ],
      interactiveDemoType: 'sslstrip'
    },
    {
      id: 'rogueca',
      title: 'Rogue Certificate Authority & Trust Store Compromise',
      layer: 'PKI / Public Key Cryptography',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      summary: 'Issuing fraudulent X.509 certificates using a compromised, coerced, or rogue Certificate Authority trusted by the client operating system.',
      mechanism: 'Browsers rely on a root store of ~150 trusted Certificate Authorities. If an attacker breaches any single CA in that list, they can generate a cryptographically valid SSL certificate for any domain name on the Internet. The client’s browser accepts it without displaying any warning!',
      realWorldIncident: 'In 2011, Dutch CA DigiNotar was hacked, issuing rogue certificates for *.google.com used to intercept over 300,000 Iranian users. DigiNotar went bankrupt after browser vendors revoked its root trust.',
      defenseTactics: [
        'Certificate Transparency (CT Logs / RFC 6962): All valid public certs must be recorded in publicly auditable append-only logs',
        'Public Key / Certificate Pinning: Hardcoding server public key hashes in client apps',
        'DNS Certification Authority Authorization (CAA records)'
      ],
      interactiveDemoType: 'rogueca'
    },
    {
      id: 'dns',
      title: 'DNS Cache Poisoning & Hijacking',
      layer: 'Application Layer / Name Resolution',
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      summary: 'Injecting fraudulent DNS responses into recursive resolvers to redirect domain lookups to attacker-controlled proxy servers.',
      mechanism: 'When a recursive resolver asks an authoritative name server for an IP address over UDP port 53, an attacker floods the resolver with forged responses guessing the 16-bit Transaction ID and UDP source port (Kaminsky attack). If the fake packet arrives first, all downstream clients resolve the domain to the attacker’s IP.',
      realWorldIncident: 'Dan Kaminsky’s famous 2008 vulnerability demonstrated widespread predictability in recursive DNS transactions worldwide.',
      defenseTactics: [
        'DNSSEC (DNS Security Extensions) with cryptographic digital signatures (RRSIG)',
        'DNS over HTTPS (DoH / RFC 8484) and DNS over TLS (DoT / RFC 7858)',
        'Source port randomization (0x20 bit encoding)'
      ],
      interactiveDemoType: 'dns'
    }
  ];

  const currentVector = vectors.find((v) => v.id === selectedVectorId) || vectors[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {vectors.map((vec) => {
          const isSelected = vec.id === selectedVectorId;
          return (
            <button
              key={vec.id}
              onClick={() => setSelectedVectorId(vec.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {vec.icon}
                <span className="text-xs font-bold text-slate-200 line-clamp-1">{vec.title}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{vec.layer}</span>
            </button>
          );
        })}
      </div>

      {/* Main Explainer Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
        {/* Title & Layer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              {currentVector.icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {currentVector.title}
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                {currentVector.layer}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative & Mechanics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                Attack Mechanism & Vector Breakdown
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {currentVector.mechanism}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Historical Context & Real-World Impact</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {currentVector.realWorldIncident}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Countermeasures & Defense Strategies</span>
              </h3>
              <ul className="mt-2 space-y-2">
                {currentVector.defenseTactics.map((tactic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Vector Sandbox Demo */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Demonstration</span>
                </span>
              </div>

              {/* Demo Type: ARP */}
              {currentVector.interactiveDemoType === 'arp' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Alice's ARP Table Status:</span>
                    <button
                      onClick={() => setArpPoisoned(!arpPoisoned)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        arpPoisoned
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {arpPoisoned ? 'Poison Injected (Revert)' : 'Inject Gratuitous ARP Reply'}
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded p-2.5 font-mono text-[11px] overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800">
                          <th className="pb-1">Internet Address</th>
                          <th className="pb-1">Physical Address (MAC)</th>
                          <th className="pb-1">Type</th>
                          <th className="pb-1">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr>
                          <td className="py-1 text-slate-200">192.168.1.1 (Gateway)</td>
                          <td className={`py-1 font-bold ${arpPoisoned ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {arpPoisoned ? '00:0C:29:8F:72:B1 (EVE)' : 'C0:25:E9:11:42:01 (ROUTER)'}
                          </td>
                          <td className="py-1 text-slate-400">dynamic</td>
                          <td className="py-1 font-bold">
                            {arpPoisoned ? (
                              <span className="text-rose-400">POISONED (MITM ACTIVE)</span>
                            ) : (
                              <span className="text-emerald-400">VERIFIED</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-200">192.168.1.137 (Eve)</td>
                          <td className="py-1 text-slate-400">00:0C:29:8F:72:B1</td>
                          <td className="py-1 text-slate-400">dynamic</td>
                          <td className="py-1 text-slate-500">Subnet Node</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Demo Type: SSL Strip */}
              {currentVector.interactiveDemoType === 'sslstrip' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">HSTS Header Enforcement:</span>
                    <button
                      onClick={() => setHstsEnabled(!hstsEnabled)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        hstsEnabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {hstsEnabled ? 'HSTS Preload: ENABLED' : 'HSTS: DISABLED (VULNERABLE)'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 rounded font-mono text-[11px] flex flex-col gap-2">
                    <div className="text-slate-400">
                      User inputs: <span className="text-white">http://securebank.com</span>
                    </div>
                    {hstsEnabled ? (
                      <div className="text-emerald-400 flex flex-col gap-1">
                        <div>&gt; Browser Internal Check: Domain in HSTS Preload list</div>
                        <div>&gt; Action: Internal redirect to <strong>https://securebank.com</strong> without network request</div>
                        <div>&gt; Result: Eve cannot downgrade to HTTP. Attack defeated!</div>
                      </div>
                    ) : (
                      <div className="text-rose-400 flex flex-col gap-1">
                        <div>&gt; Server responds: 302 Found (Location: https://securebank.com)</div>
                        <div>&gt; Eve intercepts 302: Drops redirect, proxies HTTPS to server</div>
                        <div>&gt; Eve returns 200 OK over plain HTTP to Alice. Padlock icon is gone!</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demo Type: Rogue CA */}
              {currentVector.interactiveDemoType === 'rogueca' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Certificate Transparency & Pinning:</span>
                    <button
                      onClick={() => setCtVerificationEnabled(!ctVerificationEnabled)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        ctVerificationEnabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {ctVerificationEnabled ? 'CT & Key Pinning: ACTIVE' : 'Rely Only on OS Root Store'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 rounded font-mono text-[11px] flex flex-col gap-2">
                    <div className="text-slate-400">
                      Certificate Presented: <span className="text-white">CN=*.google.com (Issued by DigiNotar CA)</span>
                    </div>
                    {ctVerificationEnabled ? (
                      <div className="text-emerald-400 flex flex-col gap-1">
                        <div>&gt; Pinning Hash Check: SHA256 pin does not match hardcoded public key</div>
                        <div>&gt; SCT Check: No signed certificate timestamp in public CT log</div>
                        <div>&gt; Connection Aborted: SEC_ERROR_REVOKED_CERTIFICATE</div>
                      </div>
                    ) : (
                      <div className="text-rose-400 flex flex-col gap-1">
                        <div>&gt; OS Root Store Check: DigiNotar Root is in Trusted Root CAs list</div>
                        <div>&gt; Signature matches CA private key!</div>
                        <div>&gt; Browser shows green padlock! Attacker intercepts all encrypted sessions silently.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demo Type: DNS */}
              {currentVector.interactiveDemoType === 'dns' && (
                <div className="p-3 bg-slate-900 rounded font-mono text-[11px] flex flex-col gap-2">
                  <div className="text-slate-400">
                    Query: <span className="text-white">A record for bank.com</span>
                  </div>
                  <div className="text-amber-400">
                    &gt; Legitimate Authoritative IP: 198.51.100.42
                  </div>
                  <div className="text-rose-400">
                    &gt; Attacker Injected Cache Entry: 192.168.1.137 (Eve's Web Server)
                  </div>
                  <div className="text-emerald-400">
                    &gt; DNSSEC Defense: RRSIG cryptographic signature validated against root trust anchor (. &rarr; .com &rarr; bank.com). Forgery dropped!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
