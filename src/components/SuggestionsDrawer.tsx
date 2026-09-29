import React from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Key, 
  Cpu, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { Language } from '../translations';
import { SimulationMode, DefensesConfig } from '../types';

export interface SuggestionItem {
  id: string;
  category: 'attack' | 'defense' | 'timing' | 'crypto';
  categoryTh: string;
  categoryEn: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  actionLabelTh: string;
  actionLabelEn: string;
  applyAction: () => void;
}

interface SuggestionsDrawerProps {
  lang: Language;
  onApplyPreset: (preset: 'none' | 'basic' | 'hardened' | 'zerotrust') => void;
  onSetMode: (mode: SimulationMode) => void;
  onSelectTab: (tab: 'sandbox' | 'dh' | 'vectors' | 'defense' | 'challenges') => void;
  defenses: DefensesConfig;
  currentMode: SimulationMode;
}

export const SuggestionsDrawer: React.FC<SuggestionsDrawerProps> = ({
  lang,
  onApplyPreset,
  onSetMode,
  onSelectTab,
  defenses,
  currentMode,
}) => {
  const isTh = lang === 'th';

  const suggestions: SuggestionItem[] = [
    {
      id: 'sug_test_tamper',
      category: 'attack',
      categoryTh: 'ทดสอบการแก้ไขข้อมูล',
      categoryEn: 'Active Tampering',
      titleTh: 'ทดสอบแก้ไขยอดเงินและชื่อผู้รับเงินในสายส่ง',
      titleEn: 'Simulate In-Flight Wire Transfer Tampering',
      descTh: 'เปิดโหมด Payload Tamper เพื่อดูว่าหากไม่มีการเข้ารหัสด้วย TLS 1.3 ผู้โจมตีจะสามารถเปลี่ยนเลขบัญชีและยอดเงินธุรกรรมได้อย่างไร',
      descEn: 'Activate Payload Tamper mode to observe how cleartext HTTP allows attackers to alter wire amounts and recipient accounts undetected.',
      actionLabelTh: 'เปิดโหมด Tamper',
      actionLabelEn: 'Activate Tamper Mode',
      applyAction: () => {
        onSetMode('payload_tamper');
        onSelectTab('sandbox');
      },
    },
    {
      id: 'sug_enforce_tls',
      category: 'defense',
      categoryTh: 'มาตรการป้องกันระดับสูง',
      categoryEn: 'Defense Hardening',
      titleTh: 'เปิดใช้งานการเข้ารหัส TLS 1.3 และ AEAD Auth Tag',
      titleEn: 'Enforce TLS 1.3 with Authenticated Encryption (AEAD)',
      descTh: 'ปิดกั้นการดักอ่านข้อความธรรมดา (Confidentiality) และตรวจจับการแก้ไขบิตข้อมูลทุกกรณีด้วยแท็ก AEAD (BAD_RECORD_MAC)',
      descEn: 'Stop cleartext sniffing and defeat data tampering by verifying cryptographically signed AEAD tags in constant time.',
      actionLabelTh: 'เปิดใช้ TLS 1.3',
      actionLabelEn: 'Enable TLS 1.3',
      applyAction: () => {
        onApplyPreset('basic');
        onSelectTab('sandbox');
      },
    },
    {
      id: 'sug_test_ssl_strip',
      category: 'attack',
      categoryTh: 'การลดระดับความปลอดภัย',
      categoryEn: 'Downgrade Attack',
      titleTh: 'จำลองการโจมตี SSL Stripping (ลดระดับเป็น HTTP ธรรมดา)',
      titleEn: 'Simulate Moxie’s SSL Stripping Downgrade',
      descTh: 'ทดสอบว่าทำไมเว็บไซต์ที่พึ่งพาการ Redirect 302 เพียงอย่างเดียวจึงถูกดักจับได้ และทำไม HSTS Preload จึงเป็นทางแก้เดียวที่สมบูรณ์',
      descEn: 'Discover why standard 302 redirects fail against in-line proxies and verify how HSTS Preloading eliminates HTTP fallbacks entirely.',
      actionLabelTh: 'ทดลอง SSL Strip',
      actionLabelEn: 'Test SSL Strip',
      applyAction: () => {
        onSetMode('ssl_strip');
        onSelectTab('sandbox');
      },
    },
    {
      id: 'sug_enforce_hsts',
      category: 'defense',
      categoryTh: 'การป้องกันเบราว์เซอร์',
      categoryEn: 'Browser Hardening',
      titleTh: 'เปิดใช้งาน HSTS Preload & ป้องกันการดาวน์เกรด',
      titleEn: 'Enforce HSTS Preload Policy & Pinning',
      descTh: 'ตั้งค่าสถานะความปลอดภัย Hardened Web ที่บังคับให้เบราว์เซอร์เชื่อมต่อผ่าน HTTPS เท่านั้น และปฏิเสธการเชื่อมต่อที่ไม่ปลอดภัย',
      descEn: 'Switch to Hardened Web preset with Strict-Transport-Security to force browsers to reject unencrypted downgrades.',
      actionLabelTh: 'ตั้งค่า Hardened Web',
      actionLabelEn: 'Apply Hardened Web',
      applyAction: () => {
        onApplyPreset('hardened');
        onSelectTab('sandbox');
      },
    },
    {
      id: 'sug_dh_lab',
      category: 'crypto',
      categoryTh: 'วิทยาการรหัสลับ',
      categoryEn: 'Cryptography Lab',
      titleTh: 'เจาะลึกการดักสลับคีย์ในการแลกเปลี่ยน Diffie-Hellman',
      titleEn: 'Explore Diffie-Hellman Key Replacement Paradox',
      descTh: 'ดูการคำนวณโมดูลาร์ g^a mod p ทีละขั้นตอน และสาเหตุที่การไม่มีลายเซ็นดิจิทัลทำให้ Eve สลับคีย์สองชุดแยกกันได้',
      descEn: 'Walk through modular arithmetic step-by-step to understand how Eve establishes two separate secret keys without endpoint authentication.',
      actionLabelTh: 'ไปที่แล็บ DH',
      actionLabelEn: 'Open DH Lab',
      applyAction: () => {
        onSelectTab('dh');
      },
    },
    {
      id: 'sug_zerotrust_mtls',
      category: 'defense',
      categoryTh: 'สถาปัตยกรรม Zero Trust',
      categoryEn: 'Zero Trust Architecture',
      titleTh: 'ตั้งค่าการยืนยันตัวตนแบบสองทางด้วย Mutual TLS (mTLS)',
      titleEn: 'Configure Mutual Authentication (mTLS Client Certificates)',
      descTh: 'บังคับให้ทั้งไคลเอ็นต์และเซิร์ฟเวอร์ต้องมีใบรับรอง X.509 ป้องกันการสวมรอยจากพร็อกซีหรือคอนเทนเนอร์แปลกปลอมในระบบคลาวด์',
      descEn: 'Mandate client and server X.509 certificate validation to prevent unauthorized proxy insertion inside internal clusters.',
      actionLabelTh: 'เปิดใช้ Zero Trust (mTLS)',
      actionLabelEn: 'Enable Zero Trust',
      applyAction: () => {
        onApplyPreset('zerotrust');
        onSelectTab('sandbox');
      },
    },
    {
      id: 'sug_test_missions',
      category: 'crypto',
      categoryTh: 'ฝึกฝนทักษะจริง',
      categoryEn: 'Challenge Labs',
      titleTh: 'ทดสอบแก้โจทย์ปฏิบัติการความปลอดภัย 4 ภารกิจ (Defense Missions)',
      titleEn: 'Complete 4 Guided Cybersecurity Defense Labs',
      descTh: 'ฝึกวิเคราะห์สถานการณ์จริง เช่น การปล้นเงินในสายส่ง, การดักฟัง Wi-Fi สนามบิน, วิกฤต DigiNotar CA และไมโครเซอร์วิส',
      descEn: 'Test your defensive engineering abilities across real scenarios: Wire Heists, Airport Hotspots, Compromised CAs, and Microservice auth.',
      actionLabelTh: 'เริ่มภารกิจ',
      actionLabelEn: 'Start Missions',
      applyAction: () => {
        onSelectTab('challenges');
      },
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
              {isTh ? 'คำแนะนำการทดลองทั้งหมด (All Lab Suggestions & Scenarios)' : 'All Guided Suggestions & Next Actions'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isTh 
                ? 'เลือกคำแนะนำเพื่อทดสอบสถานการณ์จำลอง การโจมตี และการตั้งค่าความปลอดภัยที่แนะนำในคลิกเดียว' 
                : 'Curated list of attack scenarios, cryptographic hardening presets, and defensive exercises'}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400 self-start sm:self-auto bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
          {suggestions.length} {isTh ? 'คำแนะนำพร้อมใช้งาน' : 'Suggestions Available'}
        </span>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((sug) => {
          return (
            <div
              key={sug.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    sug.category === 'attack'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : sug.category === 'defense'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : sug.category === 'timing'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {isTh ? sug.categoryTh : sug.categoryEn}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                  {isTh ? sug.titleTh : sug.titleEn}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTh ? sug.descTh : sug.descEn}
                </p>
              </div>

              <button
                onClick={sug.applyAction}
                className="mt-1 flex items-center justify-between px-3 py-1.5 rounded bg-slate-900 hover:bg-cyan-950 hover:text-cyan-200 border border-slate-800 hover:border-cyan-700 text-xs font-semibold text-slate-300 transition-all"
              >
                <span>{isTh ? sug.actionLabelTh : sug.actionLabelEn}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
