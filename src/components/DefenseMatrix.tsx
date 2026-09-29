import React, { useState } from 'react';
import { Shield, Check, X, Code, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export const DefenseMatrix: React.FC = () => {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'hsts' | 'tls13' | 'mtls' | 'pinning'>('hsts');

  const matrixRows = [
    {
      name: 'TLS 1.3 Encryption & AEAD',
      layer: 'Layer 7 / Transport',
      mitigates: 'Passive sniffing, cleartext credential theft, payload tampering, message truncation',
      leavesOpen: 'Initial unencrypted HTTP requests prior to redirect; compromised root CAs',
      complexity: 'Low (Industry Standard)'
    },
    {
      name: 'HSTS & Preloading',
      layer: 'Browser / HTTP Header',
      mitigates: 'SSL Stripping, HTTP downgrade attacks, rogue Wi-Fi redirects',
      leavesOpen: 'Does not protect non-browser API clients or attackers presenting a valid trusted cert',
      complexity: 'Low (Header configuration)'
    },
    {
      name: 'Certificate Pinning (HPKP / App Pinning)',
      layer: 'Application Layer',
      mitigates: 'Rogue CAs, compromised government/corporate root stores, DigiNotar-style attacks',
      leavesOpen: 'Certificate rotation risk (brick risk if keys are lost without backup pins)',
      complexity: 'Medium / High'
    },
    {
      name: 'Mutual TLS (mTLS)',
      layer: 'Bidirectional Cryptography',
      mitigates: 'Client impersonation, unauthenticated proxy injection, zero-trust API tampering',
      leavesOpen: 'Endpoint compromise (if private key is exfiltrated from client device)',
      complexity: 'High (PKI management)'
    },
    {
      name: 'Dynamic ARP Inspection (DAI)',
      layer: 'Layer 2 (Switching)',
      mitigates: 'ARP cache poisoning, gratuitous ARP flooding on local switches',
      leavesOpen: 'Attacks occurring beyond the local broadcast domain / Layer 3 routing',
      complexity: 'Medium (Managed switch config)'
    },
    {
      name: 'DNSSEC & DNS-over-HTTPS (DoH)',
      layer: 'DNS / Transport',
      mitigates: 'DNS cache poisoning, Kaminsky forgery, ISP DNS redirection',
      leavesOpen: 'Direct IP connections bypassing DNS queries',
      complexity: 'Medium (Domain registrar config)'
    }
  ];

  const snippets = {
    hsts: {
      title: 'Nginx HSTS Preload Hardening',
      description: 'Enforces HTTPS for 1 year across all subdomains and authorizes inclusion in browser preload lists.',
      language: 'nginx',
      code: `# Ensure HSTS is delivered strictly over HTTPS
server {
    listen 443 ssl http2;
    server_name api.securebank.com;

    # HSTS header with 2-year max-age, all subdomains, and preload consent
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Prevent MIME type sniffing and clickjacking
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
}`
    },
    tls13: {
      title: 'Hardened TLS 1.3 & Forward Secrecy Config',
      description: 'Restricts protocols to TLS 1.2 and TLS 1.3 only, enforcing modern AEAD ciphers and OCSP stapling.',
      language: 'nginx',
      code: `ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

# Modern AEAD ciphers only (AES-GCM and ChaCha20-Poly1305)
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';

# Session cache & ticket configuration
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling: Prevents CA verification delays and revocation bypass
ssl_stapling on;
ssl_stapling_verify on;`
    },
    mtls: {
      title: 'Mutual TLS (mTLS) Client Certificate Enforcement',
      description: 'Nginx validates that the incoming client connection possesses a certificate signed by internal CA.',
      language: 'nginx',
      code: `server {
    listen 443 ssl http2;
    server_name internal-api.enterprise.io;

    ssl_certificate /etc/ssl/server.crt;
    ssl_certificate_key /etc/ssl/server.key;

    # Require client certificate verification
    ssl_client_certificate /etc/ssl/internal-ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;

    location / {
        # Pass verified client fingerprint to backend
        proxy_set_header X-Client-DN $ssl_client_s_dn;
        proxy_set_header X-Client-Verified $ssl_client_verify;
        proxy_pass http://internal_backend;
    }
}`
    },
    pinning: {
      title: 'Android Network Security Config (Public Key Pinning)',
      description: 'Binds mobile application network traffic to specific SPKI SHA-256 hashes, preventing rogue CA interception.',
      language: 'xml',
      code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config>
        <domain includeSubdomains="true">api.securebank.com</domain>
        <pin-set expiration="2027-12-31">
            <!-- Primary Certificate SPKI Hash -->
            <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin>
            <!-- Backup Certificate SPKI Hash (Mandatory to avoid bricking) -->
            <pin digest="SHA-256">rFjc3AbGqmPrlxUgg2MmEIkgTUhgW340QuQC8GQIwDA=</pin>
        </pin-set>
    </domain-config>
</network-security-config>`
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Comparative Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              MITM Defense Comparison & Coverage Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Layer-by-Layer Cryptographic Hardening
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">Defense Mechanism</th>
                <th className="pb-3 font-semibold">OSI / Stack Layer</th>
                <th className="pb-3 font-semibold">Threats Fully Neutralized</th>
                <th className="pb-3 font-semibold">Remaining Residual Risk</th>
                <th className="pb-3 font-semibold">Implementation Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {matrixRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-white pr-4">
                    {row.name}
                  </td>
                  <td className="py-3 font-mono text-cyan-400 pr-4">
                    {row.layer}
                  </td>
                  <td className="py-3 text-slate-200 pr-4 leading-relaxed">
                    {row.mitigates}
                  </td>
                  <td className="py-3 text-slate-400 pr-4 leading-relaxed">
                    {row.leavesOpen}
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-300">
                    {row.complexity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Hardening Snippets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Production Hardening Configurations
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveSnippetTab('hsts')}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                activeSnippetTab === 'hsts'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              HSTS Preloading
            </button>
            <button
              onClick={() => setActiveSnippetTab('tls13')}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                activeSnippetTab === 'tls13'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              TLS 1.3 Ciphers
            </button>
            <button
              onClick={() => setActiveSnippetTab('mtls')}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                activeSnippetTab === 'mtls'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              mTLS Client Certs
            </button>
            <button
              onClick={() => setActiveSnippetTab('pinning')}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                activeSnippetTab === 'pinning'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Mobile Key Pinning
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              {snippets[activeSnippetTab].title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {snippets[activeSnippetTab].description}
            </span>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            {snippets[activeSnippetTab].code}
          </pre>
        </div>
      </div>
    </div>
  );
};
