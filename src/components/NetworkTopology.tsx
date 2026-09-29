import React, { useState, useEffect, useRef } from 'react';
import { SimulationMode, DefensesConfig, PacketPayload, LogEntry } from '../types';
import { Language, UI_TRANSLATIONS } from '../translations';
import { 
  Laptop, 
  Server, 
  Skull, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Play, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Lock,
  Unlock,
  Radio,
  Network,
  Clock,
  Timer,
  Gauge,
  Zap,
  Activity,
  Sliders,
  FileSearch,
  Binary,
  Copy,
  Check,
  Layers,
  Terminal
} from 'lucide-react';
import { 
  simulateCiphertext, 
  stringToHex, 
  generateDetailedHexDump, 
  buildFullHttpWireFrame,
  HexDumpRow 
} from '../utils/cryptoUtils';

interface NetworkTopologyProps {
  mode: SimulationMode;
  defenses: DefensesConfig;
  payloadText: string;
  tamperedPayloadText: string;
  headers: Record<string, string>;
  onLogEvent: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  logs: LogEntry[];
  lang?: Language;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  mode,
  defenses,
  payloadText,
  tamperedPayloadText,
  headers,
  onLogEvent,
  logs,
  lang = 'th',
}) => {
  const isTh = lang === 'th';
  const t = UI_TRANSLATIONS[lang];

  // Log and Packet Capture Tabs
  const [logTab, setLogTab] = useState<'events' | 'pcap'>('pcap');
  const [pcapHop, setPcapHop] = useState<'alice' | 'eve' | 'bob'>('eve');
  const [pcapScope, setPcapScope] = useState<'full' | 'body'>('full');
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [copiedAscii, setCopiedAscii] = useState<boolean>(false);

  // Animation state: 0 = at Alice, 1 = in transit to Eve, 2 = at Eve (intercepted), 3 = in transit to Bob, 4 = at Bob (received)
  const [packetStep, setPacketStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPacket, setCurrentPacket] = useState<PacketPayload | null>(null);
  const [outcome, setOutcome] = useState<{
    status: 'delivered' | 'tampered_success' | 'blocked_integrity' | 'blocked_cert' | 'blocked_hsts' | 'dropped';
    title: string;
    details: string;
  } | null>(null);

  // Latency & Timing Attack Simulation State
  const [enableLatencySim, setEnableLatencySim] = useState<boolean>(true);
  const [bobRtt, setBobRtt] = useState<number>(140); // Alice to Bob Round-Trip Time (ms)
  const [eveDelay, setEveDelay] = useState<number>(25); // Eve intercept and injection delay (ms)
  const [timingAttackMode, setTimingAttackMode] = useState<'race_condition' | 'padding_oracle'>('race_condition');
  
  // Timing race execution state
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceTimeElapsed, setRaceTimeElapsed] = useState<number>(0);
  const [raceOutcome, setRaceOutcome] = useState<{
    winner: 'eve' | 'bob';
    deltaMs: number;
    summary: string;
  } | null>(null);

  // One-way propagation times
  const bobOneWay = Math.round(bobRtt / 2);
  const timingDelta = bobOneWay - eveDelay; // If > 0, Eve is faster than legitimate server!

  // Initialize or reset packet
  const createFreshPacket = (): PacketPayload => {
    const isEncrypted = defenses.tls13;
    const { ciphertext, tag } = simulateCiphertext(payloadText);
    
    return {
      id: `pkt_${Date.now().toString(36)}`,
      source: 'Alice',
      destination: 'Bob',
      type: isEncrypted ? 'HTTPS_TLS13' : 'HTTP',
      plainContent: payloadText,
      tamperedContent: tamperedPayloadText,
      encryptedContent: isEncrypted ? `${ciphertext} (Auth Tag: ${tag})` : undefined,
      headers: { ...headers },
      isTampered: false,
      isDropped: false,
      isReplayed: mode === 'replay_attack',
      isEncrypted,
      timestamp: new Date().toLocaleTimeString(),
      hexBytes: stringToHex(payloadText.slice(0, 32)),
      status: 'in_transit',
    };
  };

  const handleStartTransmission = () => {
    const pkt = createFreshPacket();
    setCurrentPacket(pkt);
    setPacketStep(1);
    setOutcome(null);
    setIsPlaying(true);

    onLogEvent({
      source: 'ALICE',
      type: 'info',
      message: `Alice transmitted packet (${pkt.type}) to Bob`,
      details: defenses.tls13 
        ? (isTh ? 'เปิดใช้งานช่องทางเข้ารหัส TLS 1.3' : 'TLS 1.3 encrypted channel active')
        : (isTh ? 'ส่งข้อมูลธรรมดาแบบไม่เข้ารหัส (Cleartext)' : 'Unencrypted plaintext transmission')
    });
  };

  const handleReset = () => {
    setPacketStep(0);
    setIsPlaying(false);
    setOutcome(null);
    setCurrentPacket(null);
    setIsRacing(false);
    setRaceTimeElapsed(0);
    setRaceOutcome(null);
  };

  // Run Timing Race Simulation (DNS Spoofing / ARP Race / TCP Injection)
  const runTimingRace = () => {
    setIsRacing(true);
    setRaceTimeElapsed(0);
    setRaceOutcome(null);

    onLogEvent({
      source: 'SYSTEM',
      type: 'attack',
      message: isTh 
        ? `เริ่มการจำลองการแข่งจังหวะเวลา (Timing Race): Alice กำลังรอการตอบกลับ (Server RTT: ${bobRtt}ms, Eve Delay: ${eveDelay}ms)`
        : `Initiating Timing Race Simulation: Alice awaiting response (Server RTT: ${bobRtt}ms, Eve Delay: ${eveDelay}ms)`,
    });

    const maxDuration = Math.max(bobOneWay, eveDelay) + 20;
    const interval = 10;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setRaceTimeElapsed(elapsed);

      if (elapsed >= maxDuration) {
        clearInterval(timer);
        setIsRacing(false);

        if (eveDelay < bobOneWay) {
          // Eve wins race window!
          const diff = bobOneWay - eveDelay;
          setRaceOutcome({
            winner: 'eve',
            deltaMs: diff,
            summary: isTh 
              ? `Eve ส่งแพ็กเก็ตปลอมถึง Alice เร็วกว่าเซิร์ฟเวอร์จริง ${diff}ms! Alice ยอมรับคำตอบปลอมและแคชตารางเรียบร้อย`
              : `Eve won the race window by ${diff}ms! Alice accepted and cached the spoofed response prior to server arrival.`
          });
          onLogEvent({
            source: 'EVE',
            type: 'attack',
            message: isTh 
              ? `การโจมตี Race Attack สำเร็จ: แพ็กเก็ตปลอมของ Eve ถึงก่อนเซิร์ฟเวอร์จริง ${diff}ms`
              : `Race Attack Succeeded: Eve's injected packet arrived ${diff}ms before the legitimate server!`,
          });
        } else {
          // Bob wins!
          const diff = eveDelay - bobOneWay;
          setRaceOutcome({
            winner: 'bob',
            deltaMs: diff,
            summary: isTh 
              ? `เซิร์ฟเวอร์จริงส่งถึง Alice ก่อน ${diff}ms! แพ็กเก็ตปลอมของ Eve มาช้าเกินไปและถูกตัดทิ้งเป็นแพ็กเก็ตซ้ำ`
              : `Legitimate server arrived ${diff}ms faster! Eve's late spoofed injection was dropped by client protocol stack.`
          });
          onLogEvent({
            source: 'BOB',
            type: 'defense',
            message: isTh 
              ? `การป้องกันจังหวะเวลาสำเร็จ: แพ็กเก็ตจริงถึงก่อน ${diff}ms คำตอบปลอมถูกปฏิเสธ`
              : `Timing Defense: Server response arrived ${diff}ms earlier; malicious race injection dropped.`,
          });
        }
      }
    }, interval);
  };

  // Step progression logic
  const advanceStep = () => {
    if (!currentPacket && packetStep === 0) {
      handleStartTransmission();
      return;
    }

    if (packetStep === 1) {
      // Moving to Eve (or bypassing if direct)
      if (mode === 'direct') {
        setPacketStep(3);
        onLogEvent({
          source: 'SYSTEM',
          type: 'info',
          message: isTh ? 'ส่งตรงผ่านเกตเวย์: ข้ามตัวดักฟัง' : 'Direct transmission: Bypassing intermediary taps',
        });
      } else {
        setPacketStep(2);
        handleEveInterception();
      }
    } else if (packetStep === 2) {
      if (mode === 'drop_packet') {
        setPacketStep(4);
        setOutcome({
          status: 'dropped',
          title: isTh ? 'แพ็กเก็ตถูกทิ้งกลางทาง (Denial of Service)' : 'Packet Dropped (Denial of Service)',
          details: isTh 
            ? 'Eve ดักจับแพ็กเก็ตแล้วทิ้งทันที เซิร์ฟเวอร์ Bob ไม่ได้รับคำขอ' 
            : 'Eve intercepted the packet and dropped it. Bob never receives the request.',
        });
        onLogEvent({
          source: 'EVE',
          type: 'attack',
          message: isTh ? 'Eve ตัดทิ้งแพ็กเก็ต (Blackhole attack)' : 'Eve dropped packet silently (Blackhole attack)',
        });
      } else if (mode === 'ssl_strip' && defenses.hsts) {
        setPacketStep(4);
        setOutcome({
          status: 'blocked_hsts',
          title: isTh ? 'การโจมตี SSL Strip ถูกบล็อกด้วย HSTS' : 'SSL Strip Blocked by HSTS Policy',
          details: isTh 
            ? 'เบราว์เซอร์ของ Alice ปฏิเสธการดาวน์เกรดเป็น HTTP เพราะมีนโยบาย HSTS Preload บังคับ' 
            : 'Alice’s browser strictly enforced HTTPS due to HSTS preloading. Plain HTTP downgrade rejected!',
        });
        onLogEvent({
          source: 'DEFENSE',
          type: 'defense',
          message: isTh ? 'บังคับใช้ HSTS: ปฏิเสธการลดระดับเป็น HTTP' : 'HSTS enforced: Client refused to downgrade to plain HTTP',
        });
      } else {
        setPacketStep(3);
        onLogEvent({
          source: 'EVE',
          type: 'info',
          message: mode === 'payload_tamper' 
            ? (isTh ? 'Eve ส่งต่อแพ็กเก็ตที่แก้ไขแล้วไปยัง Bob' : 'Eve forwarded tampered packet toward Bob')
            : (isTh ? 'Eve ส่งต่อแพ็กเก็ตไปยัง Bob' : 'Eve forwarded packet toward Bob'),
        });
      }
    } else if (packetStep === 3) {
      setPacketStep(4);
      evaluateBobReception();
    }
  };

  const handleEveInterception = () => {
    if (mode === 'passive_sniff') {
      onLogEvent({
        source: 'EVE',
        type: 'warning',
        message: defenses.tls13 
          ? (isTh ? 'Eve ดักฟังสตรีม: เป็นรหัสลับที่อ่านไม่ออก (TLS 1.3)' : 'Eve sniffed packet: Ciphertext is unreadable (TLS 1.3)')
          : (isTh ? `Eve ดักข้อมูลรหัสผ่าน/ข้อความธรรมดา: "${payloadText.slice(0, 35)}..."` : `Eve sniffed cleartext credentials/payload: "${payloadText.slice(0, 35)}..."`),
      });
    } else if (mode === 'payload_tamper') {
      onLogEvent({
        source: 'EVE',
        type: 'attack',
        message: isTh ? 'Eve ดักจับแพ็กเก็ตและแก้ไขข้อมูลกลางทาง' : 'Eve intercepted packet and modified payload in transit',
        details: isTh ? `แก้ไขเป็น: ${tamperedPayloadText.slice(0, 45)}...` : `Altered to: ${tamperedPayloadText.slice(0, 45)}...`
      });
    } else if (mode === 'ssl_strip') {
      onLogEvent({
        source: 'EVE',
        type: 'attack',
        message: isTh 
          ? 'Eve เริ่มโจมตี SSL Strip: ตัดการเปลี่ยนเส้นทาง HTTPS 302 และส่ง HTTP ข้อความธรรมดาให้ Alice' 
          : 'Eve initiated SSL Strip: Intercepting HTTPS 302 redirect and serving unencrypted HTTP to Alice',
      });
    } else if (mode === 'replay_attack') {
      onLogEvent({
        source: 'EVE',
        type: 'attack',
        message: isTh ? 'Eve ส่งซ้ำแพ็กเก็ตธุรกรรมที่เคยดักจับไว้' : 'Eve replaying previously captured transaction packet',
      });
    }
  };

  const evaluateBobReception = () => {
    if (mode === 'payload_tamper') {
      if (defenses.tls13 || defenses.hmacIntegrity) {
        setOutcome({
          status: 'blocked_integrity',
          title: isTh ? 'ตรวจพบการแก้ไขข้อมูลและถูกบล็อก!' : 'Tampering Detected & Blocked!',
          details: defenses.tls13 
            ? (isTh ? 'แท็กการตรวจสอบ TLS 1.3 AEAD (AES-GCM) ไม่ตรงกัน: BAD_RECORD_MAC เซิร์ฟเวอร์ปฏิเสธข้อมูล' : 'TLS 1.3 AEAD (AES-GCM) authentication tag mismatch: BAD_RECORD_MAC. Bob rejected the modified packet.')
            : (isTh ? 'การตรวจสอบลายเซ็น HMAC ล้มเหลว Bob ทิ้งแพ็กเก็ตที่ถูกดัดแปลง' : 'HMAC signature verification failed. Bob dropped the altered packet.'),
        });
        onLogEvent({
          source: 'BOB',
          type: 'defense',
          message: isTh ? 'การตรวจสอบความสมบูรณ์ล้มเหลว: Bob ปฏิเสธแพ็กเก็ต' : 'Integrity check failed: Bob rejected tampered packet (AEAD tag / HMAC mismatch)',
        });
      } else {
        setOutcome({
          status: 'tampered_success',
          title: isTh ? 'การโจมตี MITM สำเร็จ!' : 'MITM Attack Succeeded!',
          details: isTh 
            ? 'การส่งแบบ HTTP ธรรมดาไม่มีการเข้ารหัส ทำให้ Eve แก้ไขข้อมูลในแพ็กเก็ตได้โดย Bob ไม่รู้ตัว!' 
            : 'Unprotected plain HTTP allowed Eve to modify values in transit. Bob accepted the fraudulent data!',
        });
        onLogEvent({
          source: 'BOB',
          type: 'error',
          message: isTh ? 'วิกฤต: Bob ประมวลผลข้อมูลที่ถูกแก้ไขโดยไม่รู้ตัว!' : 'CRITICAL: Bob processed tampered transaction without knowing it was altered!',
        });
      }
    } else if (mode === 'ssl_strip') {
      if (defenses.hsts) {
        setOutcome({
          status: 'blocked_hsts',
          title: isTh ? 'SSL Strip ถูกบล็อกด้วย HSTS' : 'SSL Strip Defeated by HSTS',
          details: isTh ? 'เบราว์เซอร์ปฏิเสธการลดระดับเป็น HTTP เพราะตรวจพบนโยบาย HSTS' : 'Browser rejected plain HTTP downgrade because HSTS Strict-Transport-Security header was active.',
        });
      } else {
        setOutcome({
          status: 'tampered_success',
          title: isTh ? 'การโจมตี SSL Strip สำเร็จ!' : 'SSL Strip Successful!',
          details: isTh ? 'Eve เชื่อมต่อ HTTPS กับ Bob แต่หลอกให้ Alice ใช้ HTTP ธรรมดา ข้อมูลเซสชันรั่วไหล' : 'Eve maintains HTTPS with Bob while Alice is stuck on cleartext HTTP. All session tokens leaked to Eve.',
        });
        onLogEvent({
          source: 'EVE',
          type: 'error',
          message: isTh ? 'Eve ตัดการเข้ารหัส TLS ของเซสชัน Alice สำเร็จ' : 'Eve successfully stripped TLS encryption from Alice’s session',
        });
      }
    } else if (mode === 'replay_attack') {
      if (defenses.tls13) {
        setOutcome({
          status: 'blocked_integrity',
          title: isTh ? 'ปฏิเสธการโจมตี Replay Attack' : 'Replay Attack Rejected',
          details: isTh ? 'TLS 1.3 มีลำดับนัมเบอร์แพ็กเก็ตและ Nonce เฉพาะตัว แพ็กเก็ตที่ส่งซ้ำจึงถูกปฏิเสธ' : 'TLS 1.3 enforces implicit packet sequence numbers and nonces. The duplicate packet was rejected by Bob.',
        });
        onLogEvent({
          source: 'BOB',
          type: 'defense',
          message: isTh ? 'ปฏิเสธแพ็กเก็ตซ้ำ: Sequence counter ถูกใช้ไปแล้ว' : 'Replay rejected: Sequence counter already consumed',
        });
      } else {
        setOutcome({
          status: 'tampered_success',
          title: isTh ? 'การโจมตี Replay Attack สำเร็จ!' : 'Replay Attack Succeeded!',
          details: isTh ? 'Bob ประมวลผลธุรกรรมซ้ำเนื่องจากไม่มีระบบตรวจจับความสดของเวลาหรือ Nonce' : 'Bob processed the duplicate transaction without verifying timestamp freshness or anti-replay tokens.',
        });
      }
    } else if (mode === 'passive_sniff') {
      if (defenses.tls13) {
        setOutcome({
          status: 'delivered',
          title: isTh ? 'ส่งถึงปลายทางปลอดภัย (ข้อมูลลับไม่รั่วไหล)' : 'Safe Delivery (Confidentiality Intact)',
          details: isTh ? 'Eve ดักสัญญาณบนสายได้ แต่การเข้ารหัส TLS 1.3 ทำให้ไม่สามารถถอดรหัสอ่านข้อความได้' : 'Eve sniffed the wire, but TLS 1.3 encryption prevented her from reading the plaintext.',
        });
      } else {
        setOutcome({
          status: 'tampered_success',
          title: isTh ? 'ข้อมูลและรหัสผ่านรั่วไหล!' : 'Cleartext Credentials Leaked!',
          details: isTh ? 'Bob ได้รับข้อมูล แต่ Eve แอบบันทึกรหัสผ่านและคุกกี้ที่ส่งมาแบบไม่เข้ารหัส' : 'Bob received the packet, but Eve passively recorded the unencrypted payload and authentication headers.',
        });
      }
    } else {
      setOutcome({
        status: 'delivered',
        title: isTh ? 'ส่งถึง Bob ปลายทางอย่างปลอดภัย' : 'Delivered Securely to Bob',
        details: isTh ? 'แพ็กเก็ตเดินทางถึงจุดหมายโดยไม่มีการดักจับที่ไม่พึงประสงค์' : 'Packet reached destination without malicious interception.',
      });
      onLogEvent({
        source: 'BOB',
        type: 'success',
        message: isTh ? 'Bob ได้รับและประมวลผลคำขอที่ผ่านการตรวจสอบเรียบร้อย' : 'Bob successfully received and processed verified request',
      });
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && packetStep < 4) {
      // Calculate delay based on network latency simulation
      const baseDelay = enableLatencySim ? Math.max(800, bobOneWay * 8) : 1400;
      timer = setTimeout(() => {
        advanceStep();
      }, baseDelay);
    } else if (packetStep >= 4) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, packetStep, enableLatencySim, bobOneWay]);

  // Visual race progress percentages
  const eveProgress = isRacing 
    ? Math.min(100, (raceTimeElapsed / eveDelay) * 100) 
    : raceOutcome?.winner === 'eve' ? 100 : 0;
  const bobProgress = isRacing 
    ? Math.min(100, (raceTimeElapsed / bobOneWay) * 100) 
    : raceOutcome?.winner === 'bob' ? 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Visual Canvas Stage */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>{isTh ? 'โครงสร้างเครือข่าย' : 'Network Topology'}</span>
            </span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              {isTh ? 'โหมด:' : 'Mode:'} <strong className="text-cyan-300 capitalize">{mode.replace('_', ' ')}</strong>
            </span>
            {enableLatencySim && (
              <>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> RTT: {bobRtt}ms | Eve: {eveDelay}ms
                </span>
              </>
            )}
          </div>

          {/* Stepper & Play buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartTransmission}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{packetStep === 0 ? (isTh ? 'ส่งแพ็กเก็ต' : 'Transmit Packet') : (isTh ? 'เริ่มใหม่' : 'Restart Stream')}</span>
            </button>
            <button
              onClick={advanceStep}
              disabled={packetStep >= 4}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors disabled:opacity-50"
              title="Advance single hop"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>{isTh ? 'สเต็ป' : 'Step'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Topology Visualizer */}
        <div className="relative py-8 min-h-[300px] flex items-center justify-between px-4 sm:px-12">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {mode === 'direct' ? (
              <line
                x1="18%"
                y1="50%"
                x2="82%"
                y2="50%"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="opacity-70 animate-pulse"
              />
            ) : (
              <g>
                <path
                  d="M 18% 50% Q 50% 25% 50% 28%"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-80"
                />
                <path
                  d="M 50% 28% Q 50% 25% 82% 50%"
                  fill="none"
                  stroke={mode === 'drop_packet' ? '#64748b' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeDasharray={mode === 'drop_packet' ? '2 6' : '6 4'}
                  className="opacity-80"
                />
              </g>
            )}
          </svg>

          {/* Node 1: Alice (Client) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg ${
              packetStep === 0 || packetStep === 1
                ? 'bg-cyan-950/80 border-cyan-400 shadow-cyan-950/80 scale-105'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Laptop className="w-8 h-8 text-cyan-300" />
            </div>
            <div className="text-center mt-2.5">
              <span className="text-xs font-bold text-white tracking-wide">Alice (Client)</span>
              <div className="text-[10px] text-slate-400 font-mono">192.168.1.105</div>
              <div className="text-[9px] text-slate-500 font-mono">A4:83:E7:21:49:10</div>
            </div>
            {defenses.tls13 && (
              <span className="mt-1 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> TLS 1.3 Ready
              </span>
            )}
          </div>

          {/* Node 2: Eve (Interception Station) or Router Switch */}
          {mode === 'direct' ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-400">
                <Network className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="text-center mt-2.5">
                <span className="text-xs font-semibold text-slate-300">{isTh ? 'เกตเวย์ปกติ' : 'Default Gateway'}</span>
                <div className="text-[10px] text-slate-500 font-mono">192.168.1.1</div>
                <div className="text-[9px] text-emerald-400 font-mono">Transparent Routing</div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg ${
                packetStep === 2
                  ? 'bg-rose-950/90 border-rose-500 shadow-rose-950/90 scale-110 animate-pulse'
                  : 'bg-slate-900 border-rose-900/60'
              }`}>
                <Skull className="w-8 h-8 text-rose-400" />
              </div>
              <div className="text-center mt-2.5">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-xs font-bold text-rose-300">Eve (MITM Interceptor)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">192.168.1.137</div>
                <div className="text-[9px] text-rose-400 font-mono">
                  {enableLatencySim ? `Delay: ${eveDelay}ms` : 'ARP Poisoned Cache'}
                </div>
              </div>
              <span className="mt-1 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                {mode.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Node 3: Bob (Web Server / Bank API) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg ${
              packetStep === 4
                ? outcome?.status === 'tampered_success'
                  ? 'bg-rose-950/80 border-rose-500 shadow-rose-950/80 scale-105'
                  : 'bg-emerald-950/80 border-emerald-400 shadow-emerald-950/80 scale-105'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Server className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="text-center mt-2.5">
              <span className="text-xs font-bold text-white tracking-wide">Bob (Bank API)</span>
              <div className="text-[10px] text-slate-400 font-mono">198.51.100.42</div>
              <div className="text-[9px] text-slate-500 font-mono">
                {enableLatencySim ? `RTT: ${bobRtt}ms (1-way: ${bobOneWay}ms)` : 'api.securebank.com'}
              </div>
            </div>
            {defenses.pkiCertValidation && (
              <span className="mt-1 text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> PKI Verified
              </span>
            )}
          </div>

          {/* Animated Packet Token */}
          {packetStep > 0 && packetStep < 4 && (
            <div
              className="absolute z-20 transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
              style={{
                left:
                  packetStep === 1
                    ? '32%'
                    : packetStep === 2
                    ? '50%'
                    : '68%',
                top:
                  mode === 'direct'
                    ? '50%'
                    : packetStep === 2
                    ? '30%'
                    : '40%',
              }}
            >
              <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold shadow-lg border flex items-center gap-1.5 ${
                defenses.tls13
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-cyan-950'
                  : 'bg-amber-950 border-amber-400 text-amber-200 shadow-amber-950'
              }`}>
                {defenses.tls13 ? <Lock className="w-3 h-3 text-cyan-300" /> : <Unlock className="w-3 h-3 text-amber-400" />}
                <span>
                  {packetStep === 2 && mode === 'payload_tamper'
                    ? (isTh ? 'กำลังแก้ไข...' : 'TAMPERING...')
                    : defenses.tls13
                    ? 'TLS 1.3 CIPHERTEXT'
                    : 'PLAINTEXT HTTP'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Outcome Notification Banner */}
        {outcome && (
          <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 transition-all ${
            outcome.status === 'tampered_success'
              ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              : outcome.status === 'delivered'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
          }`}>
            <div className="mt-0.5 shrink-0">
              {outcome.status === 'tampered_success' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : outcome.status === 'delivered' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold tracking-tight">
                {outcome.title}
              </h3>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                {outcome.details}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Latency & Timing Attack Controls Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                {t.latency.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isTh 
                  ? 'จำลองผลกระทบของความหน่วงเครือข่ายและการแข่งขันเวลา (Race Conditions) ในการดักจับแพ็กเก็ต' 
                  : 'Demonstrate how packet propagation latency determines the success or failure of MITM race attacks'}
              </p>
            </div>
          </div>

          {/* Toggle Latency Simulation Switch */}
          <button
            onClick={() => setEnableLatencySim(!enableLatencySim)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              enableLatencySim
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-sm shadow-amber-950'
                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.latency.toggleLabel}: {enableLatencySim ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>

        {enableLatencySim && (
          <div className="flex flex-col gap-5 pt-1">
            {/* Latency Sliders & Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Server RTT Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {t.latency.bobRtt}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {bobRtt} ms (1-way: {bobOneWay} ms)
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="400"
                  step="5"
                  value={bobRtt}
                  onChange={(e) => setBobRtt(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Fast LAN (10ms)</span>
                  <span>Regional CDN (45ms)</span>
                  <span>WAN / Cloud (140ms)</span>
                  <span>Satellite (360ms)</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    { label: 'LAN (10ms)', val: 10 },
                    { label: 'CDN (45ms)', val: 45 },
                    { label: 'Cloud WAN (140ms)', val: 140 },
                    { label: 'High Latency (320ms)', val: 320 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setBobRtt(p.val)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                        bobRtt === p.val 
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eve Injection Delay Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {t.latency.eveDelay}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-300">
                    {eveDelay} ms
                  </span>
                </div>

                <input
                  type="range"
                  min="2"
                  max="250"
                  step="2"
                  value={eveDelay}
                  onChange={(e) => setEveDelay(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Subnet Tap (5ms)</span>
                  <span>LAN Spoof (25ms)</span>
                  <span>DPI Processing (80ms)</span>
                  <span>Slow Proxy (180ms)</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    { label: 'Fast Hardware Tap (5ms)', val: 5 },
                    { label: 'Standard LAN (25ms)', val: 25 },
                    { label: 'DPI Inspection (80ms)', val: 80 },
                    { label: 'High Proxy Overhead (180ms)', val: 180 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setEveDelay(p.val)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                        eveDelay === p.val 
                          ? 'bg-rose-900 text-rose-200 border border-rose-700' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Race Condition Visualizer & Live Race Simulation */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase">
                    {t.latency.raceAttack}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono">
                    <span className="text-slate-400">{t.latency.diff}: </span>
                    <strong className={timingDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {timingDelta > 0 ? `+${timingDelta} ms (Eve Faster)` : `${timingDelta} ms (Server Faster)`}
                    </strong>
                  </div>

                  <button
                    onClick={runTimingRace}
                    disabled={isRacing}
                    className="px-3.5 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRacing ? (isTh ? 'กำลังแข่งเวลา...' : 'Racing...') : (isTh ? 'เริ่มแข่งจังหวะเวลา' : 'Run Race Test')}</span>
                  </button>
                </div>
              </div>

              {/* Dual-Track Visual Race Bars */}
              <div className="flex flex-col gap-3 py-1">
                {/* Track 1: Eve's Spoofed Response */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-rose-400 flex items-center gap-1 font-semibold">
                      <Skull className="w-3.5 h-3.5" />
                      <span>{isTh ? 'Eve: การแทรกแพ็กเก็ตปลอม (Injected Response)' : 'Eve: Spoofed Injection Transit'}</span>
                    </span>
                    <span className="text-slate-400">{eveDelay} ms target</span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                    <div
                      className="h-full bg-rose-500 transition-all duration-75 rounded-full"
                      style={{ width: `${eveProgress}%` }}
                    />
                  </div>
                </div>

                {/* Track 2: Bob's Legitimate Response */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <Server className="w-3.5 h-3.5" />
                      <span>{isTh ? 'Bob: การตอบกลับของเซิร์ฟเวอร์จริง (Legitimate Server Response)' : 'Bob: Legitimate Server Response Transit'}</span>
                    </span>
                    <span className="text-slate-400">{bobOneWay} ms target</span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                      style={{ width: `${bobProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Race Outcome Alert */}
              {raceOutcome && (
                <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-all ${
                  raceOutcome.winner === 'eve'
                    ? 'bg-rose-950/40 border-rose-500/70 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {raceOutcome.winner === 'eve' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {raceOutcome.winner === 'eve' ? t.latency.eveWins : t.latency.bobWins}
                    </h4>
                    <p className="mt-1 text-slate-300 leading-relaxed text-xs">
                      {raceOutcome.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timing Attack Theoretical Principles Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-cyan-300 font-mono">
                  {isTh ? '1. การโจมตีจังหวะเวลาแบบแข่งขัน (Race Window Attacks)' : '1. Race Condition Exploitation'}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTh
                    ? 'ในการโจมตี DNS Spoofing หรือ ARP Poisoning ผู้โจมตีต้องส่งแพ็กเก็ตปลอมให้ถึงไคลเอ็นต์ก่อนที่เซิร์ฟเวอร์จริงจะตอบกลับ หากเซิร์ฟเวอร์อยู่ไกล (RTT สูง) หน้าต่างเวลา (Race Window) จะกว้าง ทำให้ผู้โจมตีมีโอกาสชนะสูงมาก'
                    : 'In DNS Cache Poisoning or TCP Reset Injection, the attacker must arrive before the authoritative server. High server RTT expands the vulnerability window, giving LAN-based attackers a guaranteed race advantage.'}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-cyan-300 font-mono">
                  {isTh ? '2. การรั่วไหลเวลา Side-Channel (Lucky Thirteen / CBC)' : '2. Side-Channel Timing Leakage'}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTh
                    ? 'ในโหมด CBC แบบเดิม ความแตกต่างของเวลาเพียง 1-2 มิลลิวินาทีในการตรวจสอบ Padding ทำให้ Eve ถอดรหัสลับได้ทีละไบต์ แต่ใน TLS 1.3 ใช้โหมด AEAD (AES-GCM) ที่ประมวลผลแบบ Constant-Time เสมอ จึงกำจัดการโจมตีนี้ได้อย่างสิ้นเชิง'
                    : 'Legacy CBC ciphers exhibited microsecond variations when verifying MAC vs padding errors (Lucky Thirteen). Modern TLS 1.3 mandates AEAD ciphers with strict constant-time operations, eliminating timing side-channels.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Packet Inspection & Live Wire Logs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Packet Inspector Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>{isTh ? 'เครื่องมือตรวจสอบแพ็กเก็ต (Wireshark View)' : 'Deep Packet Inspector (Wireshark View)'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Hop: {packetStep === 0 ? 'Not Transmitted' : packetStep === 1 ? 'Alice -> Network' : packetStep === 2 ? 'At Eve (Proxy)' : packetStep === 3 ? 'Eve -> Bob' : 'At Bob (Received)'}
            </span>
          </div>

          {/* Protocol Stack Badges */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              L2: Ethernet II (MAC: {packetStep >= 2 && mode !== 'direct' ? '00:0C:29:8F:72:B1' : 'A4:83:E7:21:49:10'})
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              L3: IPv4 (192.168.1.105 -&gt; 198.51.100.42)
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              L4: TCP (SrcPort: 52104, DstPort: {defenses.tls13 ? 443 : 80})
            </span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              defenses.tls13 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              L7: {defenses.tls13 ? 'TLS 1.3 Record (Encrypted Application Data)' : 'HTTP/1.1 Plaintext'}
            </span>
          </div>

          {/* Payload Display */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isTh ? 'เนื้อหาแพ็กเก็ตที่ส่ง:' : 'Transmitted Payload Body:'}</span>
              <span className="text-[10px] font-mono text-slate-500">
                {defenses.tls13 ? (isTh ? 'เข้ารหัส / มี AEAD Auth Tag' : 'Encrypted / AEAD Tag Protected') : 'Raw Text'}
              </span>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-48 leading-relaxed">
              {packetStep >= 2 && mode === 'payload_tamper'
                ? tamperedPayloadText
                : defenses.tls13
                ? `// TLS 1.3 Encrypted Record (AES-256-GCM)\nCiphertext:\n${simulateCiphertext(payloadText).ciphertext}\n\nAuth Tag: ${simulateCiphertext(payloadText).tag}\nIV: ${simulateCiphertext(payloadText).iv}`
                : payloadText}
            </pre>
          </div>

          {/* Hex Preview */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-mono">
              {isTh ? 'สตรีมข้อมูล Hex Dump (32 ไบต์แรก):' : 'Hex Stream Dump (first 32 bytes):'}
            </span>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-cyan-400 overflow-x-auto">
              {stringToHex(
                packetStep >= 2 && mode === 'payload_tamper'
                  ? tamperedPayloadText.slice(0, 32)
                  : payloadText.slice(0, 32)
              )}
            </div>
          </div>
        </div>

        {/* Security Audit Event Log & Detailed Packet Capture Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
          {/* Header with View Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setLogTab('pcap')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  logTab === 'pcap'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Binary className="w-3.5 h-3.5" />
                <span>{t.pcap.tabPcap}</span>
              </button>
              <button
                onClick={() => setLogTab('events')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  logTab === 'events'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>{t.pcap.tabEvents} ({logs.length})</span>
              </button>
            </div>

            {logTab === 'pcap' && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  defenses.tls13
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                }`}>
                  {defenses.tls13 ? 'TLS 1.3' : (isTh ? 'TLS ปิด (Cleartext)' : 'TLS OFF (Cleartext)')}
                </span>
                <span className="text-slate-500">
                  {new TextEncoder().encode(
                    defenses.tls13 
                      ? simulateCiphertext(pcapHop === 'alice' ? payloadText : (mode === 'payload_tamper' ? tamperedPayloadText : payloadText)).ciphertext 
                      : (pcapScope === 'full' ? buildFullHttpWireFrame('POST', '/api/v1/payment', headers, pcapHop === 'alice' ? payloadText : (mode === 'payload_tamper' ? tamperedPayloadText : payloadText)) : (pcapHop === 'alice' ? payloadText : (mode === 'payload_tamper' ? tamperedPayloadText : payloadText)))
                  ).length} Bytes
                </span>
              </div>
            )}
          </div>

          {/* TAB 1: Detailed Packet Capture (PCAP & Canonical Hex Dump) */}
          {logTab === 'pcap' && (() => {
            const activeHopText = pcapHop === 'alice'
              ? payloadText
              : (mode === 'payload_tamper' ? tamperedPayloadText : payloadText);

            const activeWireContent = defenses.tls13
              ? `\x17\x03\x03\x00\x7A${simulateCiphertext(activeHopText).ciphertext.slice(0, 96)}${simulateCiphertext(activeHopText).tag}`
              : (pcapScope === 'full'
                  ? buildFullHttpWireFrame('POST', '/api/v1/transfer', headers, activeHopText)
                  : activeHopText);

            const hexRows = generateDetailedHexDump(activeWireContent);

            const handleCopyHex = () => {
              const formatted = hexRows.map(r => `${r.offset}  ${r.hexBytes}  |${r.ascii}|`).join('\n');
              navigator.clipboard.writeText(formatted);
              setCopiedHex(true);
              setTimeout(() => setCopiedHex(false), 2000);
            };

            const handleCopyText = () => {
              navigator.clipboard.writeText(activeWireContent);
              setCopiedAscii(true);
              setTimeout(() => setCopiedAscii(false), 2000);
            };

            return (
              <div className="flex flex-col gap-3">
                {/* Secondary controls strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Hop selection */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-[10px] font-mono mr-1">Tap:</span>
                    <button
                      onClick={() => setPcapHop('alice')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        pcapHop === 'alice'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.pcap.hopAlice}
                    </button>
                    <button
                      onClick={() => setPcapHop('eve')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        pcapHop === 'eve'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.pcap.hopEve}
                    </button>
                    <button
                      onClick={() => setPcapHop('bob')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        pcapHop === 'bob'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.pcap.hopBob}
                    </button>
                  </div>

                  {/* Scope and Copy actions */}
                  <div className="flex items-center gap-1.5">
                    {!defenses.tls13 && (
                      <button
                        onClick={() => setPcapScope(pcapScope === 'full' ? 'body' : 'full')}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                      >
                        {pcapScope === 'full' ? t.pcap.fullFrame : t.pcap.payloadOnly}
                      </button>
                    )}
                    <button
                      onClick={handleCopyHex}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy canonical hex dump to clipboard"
                    >
                      {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHex ? t.pcap.copied : t.pcap.copyHex}</span>
                    </button>
                  </div>
                </div>

                {/* Cleartext Exposure or Encryption Banner */}
                {!defenses.tls13 ? (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/80 text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        {isTh ? '⚠️ ตรวจพบข้อมูลข้อความธรรมดา (TLS Disabled Plaintext Exposure)' : '⚠️ Cleartext Exposure Detected (TLS Disabled)'}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {isTh
                          ? 'เนื่องจากไม่ได้เปิดการเข้ารหัส TLS ทำให้แพ็กเก็ตที่วิ่งบนสายส่งอยู่ในรูปแบบข้อความธรรมดา (Plaintext HTTP) ผู้ดักจับ (Eve) หรืออุปกรณ์ใดๆ ในเครือข่ายสามารถอ่านค่ารหัสผ่าน โทเคนการเงิน และเนื้อหา JSON ได้จากคอลัมน์ Hex/ASCII โดยตรง'
                          : 'With TLS disabled, all network frames travel in unencrypted cleartext. Any interceptor or switch mirror on the subnet can read JSON fields, authentication tokens, and credentials directly in the hex and ASCII columns below.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900/80 text-emerald-200 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        {isTh ? '🔒 ข้อมูลได้รับการเข้ารหัสด้วย TLS 1.3 (AEAD Ciphertext)' : '🔒 Cryptographically Protected (TLS 1.3 AEAD Record)'}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {isTh
                          ? 'แพ็กเก็ตได้รับการเข้ารหัสด้วย AES-256-GCM ข้อมูลที่ปรากฏในสตรีม Hex เป็นข้อมูลสุ่มเทียม (High Entropy) คอลัมน์ ASCII จึงไม่มีตัวอักษรที่อ่านออกได้ ป้องกันการดักอ่าน 100%'
                          : 'Application data is wrapped in a TLS 1.3 encrypted record (Type 0x17). The hex dump consists of high-entropy pseudorandom bytes. Zero plaintext characters or auth headers leak across the wire.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Canonical Hex Dump Terminal Table */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] leading-snug overflow-x-auto max-h-72 select-text">
                  <div className="text-slate-500 pb-1 mb-1 border-b border-slate-900 grid grid-cols-12 gap-1 text-[10px]">
                    <span className="col-span-2 text-slate-400">OFFSET</span>
                    <span className="col-span-6 text-slate-400">HEX BYTES (00-07  08-0F)</span>
                    <span className="col-span-4 text-slate-400 pl-2 border-l border-slate-900">ASCII DECODED</span>
                  </div>

                  <div className="divide-y divide-slate-950/40 space-y-0.5">
                    {hexRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-1 hover:bg-slate-900/40 py-0.5">
                        {/* Offset */}
                        <span className="col-span-2 text-cyan-500 font-bold select-none">
                          {row.offset}
                        </span>

                        {/* Hex Bytes */}
                        <span className={`col-span-6 tracking-wider ${
                          !defenses.tls13 
                            ? 'text-amber-200' 
                            : 'text-slate-400'
                        }`}>
                          {row.hexBytes}
                        </span>

                        {/* ASCII characters */}
                        <span className={`col-span-4 pl-2 border-l border-slate-900/80 font-bold truncate ${
                          !defenses.tls13 
                            ? 'text-emerald-400' 
                            : 'text-slate-600'
                        }`}>
                          {row.ascii}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensitive field highlights summary for cleartext */}
                {!defenses.tls13 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="text-rose-400 font-bold">
                      {isTh ? 'พบฟิลด์สำคัญที่ถูกเปิดเผย:' : 'Exposed Tokens in Hex Stream:'}
                    </span>
                    {activeWireContent.includes('auth_token') && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        "auth_token": Bearer tok_live_...
                      </span>
                    )}
                    {activeWireContent.includes('password') && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        "password": Super$ecure...
                      </span>
                    )}
                    {activeWireContent.includes('amount_usd') && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        "amount_usd"
                      </span>
                    )}
                    {pcapHop === 'eve' && mode === 'payload_tamper' && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        [TAMPERED BY EVE ON WIRE]
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 2: Standard Audit Event Log */}
          {logTab === 'events' && (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  {isTh ? 'ยังไม่มีบันทึกเหตุการณ์ คลิก "ส่งแพ็กเก็ต" หรือ "เริ่มแข่งจังหวะเวลา"' : 'No events recorded yet. Click "Transmit Packet" to start.'}
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded border text-xs flex flex-col gap-1 ${
                      log.type === 'attack'
                        ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                        : log.type === 'defense'
                        ? 'bg-cyan-950/30 border-cyan-900/60 text-cyan-200'
                        : log.type === 'error'
                        ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                        : log.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="font-bold tracking-wider text-slate-300">{log.source}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="font-medium text-slate-200 leading-snug">
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
