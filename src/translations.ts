export type Language = 'en' | 'th';

export const UI_TRANSLATIONS = {
  en: {
    appTitle: 'MITM Lab',
    appSubtitle: 'Interactive Cryptography & Defense Sandbox',
    tabs: {
      sandbox: 'Topology & Timing Sandbox',
      dh: 'Diffie-Hellman Interception',
      vectors: 'Attack Vectors',
      defense: 'Defense Matrix',
      challenges: 'Defense Missions',
    },
    actions: {
      transmit: 'Transmit Packet',
      reset: 'Reset Lab',
      step: 'Step',
      restarting: 'Restart Stream',
    },
    subtitles: {
      sandbox: 'Live Packet Topology, Timing Attack & Latency Simulation',
      dh: 'Diffie-Hellman Key Exchange & Interception Paradox',
      vectors: 'OSI Layer 2-7 Attack Vectors & Case Studies',
      defense: 'Cryptographic Defense Matrix & Hardening Snippets',
      challenges: 'Cybersecurity Defensive Engineering Missions',
    },
    status: {
      tlsReady: 'TLS 1.3 Protected',
      cleartext: 'Cleartext HTTP',
      eveBypassed: 'Eve Bypassed',
      eveActive: 'Eve Active In-Line',
    },
    latency: {
      title: 'Network Latency & Timing Attack Controls',
      toggleLabel: 'Simulate Latency & Race Conditions',
      bobRtt: 'Alice ↔ Bob Round-Trip (RTT)',
      eveDelay: 'Eve Interception / Injection Delay',
      raceAttack: 'Race Timing Attack Simulation (DNS Spoof / ARP Race)',
      diff: 'Timing Differential (Δt)',
      eveWins: 'Eve Wins Race Window! (Spoofed packet arrived before server)',
      bobWins: 'Legitimate Server Wins! (Server packet arrived first; spoof was too slow)',
      sidechannel: 'Side-Channel Padding Timing Leak (CBC vs AEAD constant-time)',
    },
    pcap: {
      tabEvents: 'Audit Event Log',
      tabPcap: 'Detailed Packet Capture (Raw Hex Dump)',
      tlsDisabledAlert: 'TLS DISABLED: Raw cleartext payload and sensitive auth credentials exposed on wire!',
      tlsEnabledAlert: 'TLS 1.3 ACTIVE: Payload encrypted in AEAD ciphertext record (zero plaintext leakage).',
      hopAlice: 'Alice TX (Client Egress)',
      hopEve: 'Eve Wiretap (MITM Intercept)',
      hopBob: 'Bob RX (Server Ingress)',
      copyHex: 'Copy Raw Hex',
      copied: 'Copied!',
      fullFrame: 'Full HTTP Frame',
      payloadOnly: 'Payload Only',
    }
  },
  th: {
    appTitle: 'MITM Lab',
    appSubtitle: 'ห้องทดลองความปลอดภัย Man-in-the-Middle และวิทยาการรหัสลับ',
    tabs: {
      sandbox: 'จำลองเครือข่าย & การหน่วงเวลา',
      dh: 'เจาะลึก Diffie-Hellman',
      vectors: 'รูปแบบการโจมตี (ARP/SSL)',
      defense: 'ตารางมาตรการป้องกัน',
      challenges: 'ภารกิจป้องกัน (4 Labs)',
    },
    actions: {
      transmit: 'ส่งแพ็กเก็ตข้อมูล',
      reset: 'รีเซ็ตห้องทดลอง',
      step: 'ทีละสเต็ป',
      restarting: 'เริ่มสตรีมใหม่',
    },
    subtitles: {
      sandbox: 'แผนภาพจำลองเครือข่ายสด การหน่วงเวลา (Latency) และการโจมตีจังหวะเวลา (Timing Attacks)',
      dh: 'การแลกเปลี่ยนคีย์ Diffie-Hellman และช่องโหว่การสวมรอย',
      vectors: 'เวกเตอร์การโจมตีชั้น OSI 2-7 และกรณีศึกษาเหตุการณ์จริง',
      defense: 'ตารางเปรียบเทียบกลไกป้องกันและตัวอย่างคอนฟิก Nginx/ระบบ',
      challenges: 'ภารกิจปฏิบัติการวิศวกรรมความมั่นคงปลอดภัยไซเบอร์',
    },
    status: {
      tlsReady: 'เข้ารหัสด้วย TLS 1.3',
      cleartext: 'ข้อความธรรมดา HTTP',
      eveBypassed: 'ข้ามตัวดักฟัง (ปกติ)',
      eveActive: 'ตัวดักฟังกำลังทำงาน',
    },
    latency: {
      title: 'การควบคุมการหน่วงเวลาเครือข่าย & การโจมตีจังหวะเวลา (Timing Attacks)',
      toggleLabel: 'จำลองความหน่วงและการแข่งจังหวะ (Race Conditions)',
      bobRtt: 'ความหน่วงไป-กลับ Alice ↔ Bob (RTT)',
      eveDelay: 'เวลาประมวลผลและแทรกแพ็กเก็ตของ Eve',
      raceAttack: 'การแข่งเวลาแพ็กเก็ตปลอม (DNS Spoofing / ARP Race)',
      diff: 'ส่วนต่างจังหวะเวลา (Δt)',
      eveWins: 'Eve ชนะหน้าต่างเวลา! (แพ็กเก็ตปลอมถึงก่อนเซิร์ฟเวอร์จริง)',
      bobWins: 'เซิร์ฟเวอร์จริงส่งถึงก่อน! (การแทรกแพ็กเก็ตของ Eve ช้าเกินไป)',
      sidechannel: 'การรั่วไหลเวลา Side-Channel (CBC Padding vs AEAD Constant-Time)',
    },
    pcap: {
      tabEvents: 'บันทึกเหตุการณ์ (Audit Log)',
      tabPcap: 'ตรวจสอบแพ็กเก็ตละเอียด (Detailed Hex Dump)',
      tlsDisabledAlert: 'TLS ถูกปิด: ข้อมูลข้อความธรรมดาและรหัสผ่านถูกเปิดเผยอย่างโจ่งแจ้งบนสายส่ง (Raw Hex Dump)!',
      tlsEnabledAlert: 'TLS 1.3 ทำงาน: ข้อมูลถูกเข้ารหัสแบบ AEAD ปลอดภัย ไม่มีการรั่วไหลของข้อความธรรมดา',
      hopAlice: 'Alice TX (ขาออกจากไคลเอ็นต์)',
      hopEve: 'Eve Wiretap (จุดดักจับ MITM)',
      hopBob: 'Bob RX (ขาเข้าเซิร์ฟเวอร์)',
      copyHex: 'คัดลอก Hex',
      copied: 'คัดลอกแล้ว!',
      fullFrame: 'ทั้งเฟรม HTTP (รวม Header)',
      payloadOnly: 'เฉพาะส่วนข้อมูล (Payload)',
    }
  }
};

