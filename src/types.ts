export type SimulationMode = 
  | 'direct'
  | 'passive_sniff'
  | 'payload_tamper'
  | 'drop_packet'
  | 'replay_attack'
  | 'ssl_strip';

export interface DefensesConfig {
  tls13: boolean;
  pkiCertValidation: boolean;
  hsts: boolean;
  certPinning: boolean;
  mtls: boolean;
  hmacIntegrity: boolean;
}

export interface PacketPayload {
  id: string;
  source: 'Alice' | 'Eve' | 'Bob';
  destination: 'Alice' | 'Eve' | 'Bob';
  type: 'HTTP' | 'HTTPS_TLS13' | 'DH_EXCHANGE' | 'ARP_REQUEST' | 'ARP_REPLY';
  plainContent: string;
  tamperedContent?: string;
  encryptedContent?: string;
  headers: Record<string, string>;
  isTampered: boolean;
  isDropped: boolean;
  isReplayed: boolean;
  isEncrypted: boolean;
  timestamp: string;
  hexBytes: string;
  status: 'in_transit' | 'intercepted' | 'delivered' | 'blocked_integrity' | 'blocked_cert' | 'dropped';
  blockReason?: string;
}

export interface NetworkNode {
  id: 'alice' | 'eve' | 'bob';
  name: string;
  role: string;
  ip: string;
  mac: string;
  port?: number;
  status: 'idle' | 'sending' | 'intercepting' | 'tampering' | 'verifying' | 'error' | 'success';
}

export interface ChallengeMission {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  scenario: string;
  initialDefenses: DefensesConfig;
  targetAttack: SimulationMode;
  requiredDefenses: (keyof DefensesConfig)[];
  explanation: string;
  realWorldExample: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'ALICE' | 'EVE' | 'BOB' | 'DEFENSE';
  type: 'info' | 'warning' | 'attack' | 'defense' | 'error' | 'success';
  message: string;
  details?: string;
}
