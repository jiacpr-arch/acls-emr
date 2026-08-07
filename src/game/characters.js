// Character registry — Code Blue Simulator (Ace Attorney style)
//
// ตัวละครทั้งหมดเป็น "ข้อมูล" ไม่ใช่โค้ดเกม:
//   - เกม/โจทย์อ้างถึงตัวละครด้วย charId + pose เท่านั้น
//   - รูปจริงวางที่ public/images/characters/{charId}/{pose}.webp
//     (+ {pose}_talk.webp สำหรับเฟรมปากอ้า — มีหรือไม่มีก็ได้)
//   - ถ้ายังไม่มีรูปจริง CharacterSprite จะ fallback มาใช้ SVG placeholder ในไฟล์นี้
//   - เพิ่มตัวละครใหม่ = เพิ่ม entry ที่นี่ + วางรูปในโฟลเดอร์ ไม่ต้องแตะ engine
//
// ดูวิธี generate รูปจริงใน docs/characters.md

export const POSES = ['idle', 'talk', 'panic', 'stern', 'happy'];

const OUT = '#0E1322';

function eyes(pose, x1, x2, y, iris) {
  if (pose === 'happy') {
    return `<path d="M${x1 - 9},${y} Q${x1},${y - 9} ${x1 + 9},${y}" stroke="${OUT}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
            <path d="M${x2 - 9},${y} Q${x2},${y - 9} ${x2 + 9},${y}" stroke="${OUT}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  }
  const r = pose === 'panic' ? 8.5 : 7;
  const pr = pose === 'panic' ? 2.6 : 3.4;
  return `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r + 1.5}" fill="#fff" stroke="${OUT}" stroke-width="2.6"/>
          <circle cx="${x1}" cy="${y + 1}" r="${pr}" fill="${iris}"/>
          <circle cx="${x1 + 1.5}" cy="${y - 1.5}" r="1.3" fill="#fff"/>
          <ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r + 1.5}" fill="#fff" stroke="${OUT}" stroke-width="2.6"/>
          <circle cx="${x2}" cy="${y + 1}" r="${pr}" fill="${iris}"/>
          <circle cx="${x2 + 1.5}" cy="${y - 1.5}" r="1.3" fill="#fff"/>`;
}

function brows(pose, x1, x2, y) {
  if (pose === 'stern') {
    return `<path d="M${x1 - 10},${y - 6} L${x1 + 9},${y + 1}" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
            <path d="M${x2 + 10},${y - 6} L${x2 - 9},${y + 1}" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (pose === 'panic') {
    return `<path d="M${x1 - 9},${y + 1} Q${x1},${y - 8} ${x1 + 9},${y - 2}" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
            <path d="M${x2 + 9},${y + 1} Q${x2},${y - 8} ${x2 - 9},${y - 2}" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  }
  return `<path d="M${x1 - 9},${y - 2} Q${x1},${y - 6} ${x1 + 9},${y - 2}" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
          <path d="M${x2 - 9},${y - 2} Q${x2},${y - 6} ${x2 + 9},${y - 2}" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
}

function mouth(pose, cx, y) {
  if (pose === 'panic') return `<ellipse cx="${cx}" cy="${y + 3}" rx="9" ry="11" fill="#8C3A46" stroke="${OUT}" stroke-width="2.8"/>`;
  if (pose === 'happy') return `<path d="M${cx - 12},${y} Q${cx},${y + 13} ${cx + 12},${y}" fill="#8C3A46" stroke="${OUT}" stroke-width="2.8"/>`;
  if (pose === 'stern') return `<path d="M${cx - 10},${y + 4} Q${cx},${y - 2} ${cx + 10},${y + 4}" stroke="${OUT}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<path d="M${cx - 8},${y + 2} Q${cx},${y + 6} ${cx + 8},${y + 2}" stroke="${OUT}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function mouthTalk(cx, y) {
  return `<ellipse cx="${cx}" cy="${y + 2}" rx="7" ry="6" fill="#8C3A46" stroke="${OUT}" stroke-width="2.8"/>`;
}

// wrap face parts so CharacterSprite toggles ปากปิด/ปากอ้า ระหว่างพิมพ์บทพูด
function mouthGroups(pose, cx, y) {
  return `<g data-mouth="idle">${mouth(pose, cx, y)}</g>
          <g data-mouth="talk" style="display:none">${mouthTalk(cx, y)}</g>`;
}

export const CHARACTERS = {
  nurse_mint: {
    name: 'พยาบาลมิ้นท์',
    role: 'Nurse · IV & Drugs',
    plate: ['#2FA8A0', '#17706B'],
    placeholder(pose) {
      const skin = '#F6CDA8', scrub = '#2FA8A0', scrubD = '#1E7F79', hair = '#2A2233';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M28,250 L28,206 Q28,172 100,170 Q172,172 172,206 L172,250 Z" fill="${scrub}" stroke="${OUT}" stroke-width="4"/>
      <path d="M76,176 L100,200 L124,176 L118,170 L100,186 L82,170 Z" fill="${scrubD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="150" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M52,100 Q52,42 100,40 Q148,42 148,100 Q148,140 128,152 Q114,161 100,161 Q86,161 72,152 Q52,140 52,100 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <circle cx="146" cy="58" r="17" fill="${hair}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M48,106 Q42,44 100,34 Q158,44 152,106 Q150,80 138,72 Q120,88 100,66 Q80,88 62,72 Q50,80 48,106 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 92)}
      ${eyes(pose, 80, 120, 104, '#4A3728')}
      ${mouthGroups(pose, 100, 132)}
      <path d="M96,112 L104,112" stroke="#E3AC85" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
    },
  },

  boy_compressor: {
    name: 'พี่บอย',
    role: 'Compressor',
    plate: ['#3E9E52', '#256936'],
    placeholder(pose) {
      const skin = '#EEB98C', scrub = '#3E9E52', scrubD = '#2A6E39', hair = '#171A21';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M22,250 L22,204 Q22,168 100,166 Q178,168 178,204 L178,250 Z" fill="${scrub}" stroke="${OUT}" stroke-width="4"/>
      <path d="M74,172 L100,198 L126,172 L119,166 L100,184 L81,166 Z" fill="${scrubD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="86" y="148" width="28" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M52,102 Q52,44 100,42 Q148,44 148,102 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,92 Q52,40 100,32 Q148,40 150,92 L142,90 L146,74 L132,84 L134,64 L118,78 L114,56 L100,74 L86,56 L82,78 L66,64 L68,84 L54,74 L58,90 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <rect x="54" y="84" width="92" height="10" rx="5" fill="#E5484D" stroke="${OUT}" stroke-width="3"/>
      ${brows(pose, 80, 120, 96)}
      ${eyes(pose, 80, 120, 107, '#33261B')}
      ${mouthGroups(pose, 100, 134)}
      <path d="M60,120 Q58,126 62,130 M140,120 Q142,126 138,130" stroke="#D89B6C" stroke-width="2.4" fill="none"/>
      </svg>`;
    },
  },

  fon_defib: {
    name: 'หมอฝน',
    role: 'Defib / Monitor',
    plate: ['#D98A2B', '#96570F'],
    placeholder(pose) {
      const skin = '#F6CDA8', scrub = '#D98A2B', scrubD = '#A5610E', hair = '#4A2E1E';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M28,250 L28,206 Q28,172 100,170 Q172,172 172,206 L172,250 Z" fill="${scrub}" stroke="${OUT}" stroke-width="4"/>
      <path d="M76,176 L100,200 L124,176 L118,170 L100,186 L82,170 Z" fill="${scrubD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="150" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M40,120 Q30,180 44,214 L58,208 Q48,170 56,124 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M160,120 Q170,180 156,214 L142,208 Q152,170 144,124 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M52,100 Q52,42 100,40 Q148,42 148,100 Q148,140 128,152 Q114,161 100,161 Q86,161 72,152 Q52,140 52,100 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M46,110 Q40,42 100,32 Q160,42 154,110 Q152,78 136,68 Q118,84 100,62 Q82,84 64,68 Q48,78 46,110 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 92)}
      ${eyes(pose, 80, 120, 104, '#5A3A22')}
      ${mouthGroups(pose, 100, 132)}
      </svg>`;
    },
  },

  att_dech: {
    name: 'อ.เดช',
    role: 'Attending',
    plate: ['#8E4FC8', '#5B2E86'],
    placeholder(pose) {
      const skin = '#EDBE96', coat = '#F4F6FB', coatD = '#C9D2E4', shirt = '#3C4C86', hair = '#3A3F4B';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,250 L20,206 Q20,168 100,166 Q180,168 180,204 L180,250 Z" fill="${coat}" stroke="${OUT}" stroke-width="4"/>
      <path d="M84,168 L100,250 L116,168 Q108,176 100,176 Q92,176 84,168 Z" fill="${shirt}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M100,180 L94,192 L100,236 L106,192 Z" fill="#E5484D" stroke="${OUT}" stroke-width="2.6"/>
      <path d="M60,170 Q76,186 84,168 L74,250 L36,250 Q28,200 60,170 Z" fill="${coat}" stroke="${OUT}" stroke-width="4"/>
      <path d="M140,170 Q124,186 116,168 L126,250 L164,250 Q172,200 140,170 Z" fill="${coat}" stroke="${OUT}" stroke-width="4"/>
      <path d="M62,176 L74,250 M138,176 L126,250" stroke="${coatD}" stroke-width="3" fill="none"/>
      <rect x="88" y="148" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M54,102 Q54,46 100,44 Q146,46 146,102 Q146,138 127,150 Q113,159 100,159 Q87,159 73,150 Q54,138 54,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,96 Q54,40 100,36 Q146,40 150,96 Q146,66 128,62 Q110,74 100,60 Q90,74 72,62 Q54,66 50,96 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <path d="M54,72 Q62,58 74,56 L70,66 Z" fill="#9BA3B5"/>
      <rect x="64" y="96" width="30" height="22" rx="6" fill="none" stroke="${OUT}" stroke-width="3.4"/>
      <rect x="106" y="96" width="30" height="22" rx="6" fill="none" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M94,102 L106,102" stroke="${OUT}" stroke-width="3.4"/>
      ${eyes(pose, 79, 121, 107, '#3A3228')}
      ${brows(pose, 79, 121, 90)}
      ${mouthGroups(pose, 100, 132)}
      </svg>`;
    },
  },

  // ─── ตัวละครชุดที่ 2 (รูป webp ครบทุกท่าแล้ว) ───
  // ตัวละครใหม่ในอนาคตที่รูปยังไม่ครบ: ใส่ `probeArt: true` ใน entry ไว้ก่อน →
  // CharacterSprite จะ probe หารูปก่อนเสมอ ไม่เจอค่อย fallback SVG placeholder
  // เมื่อวางรูปครบทุกท่าที่ public/images/characters/{charId}/ แล้วค่อยลบ probeArt ออก

  krit_airway: {
    name: 'หมอกฤต',
    role: 'Anesthesia · Airway',
    plate: ['#3E7BC8', '#24508C'],
    placeholder(pose) {
      const skin = '#EEB98C', scrub = '#3E7BC8', scrubD = '#24508C', cap = '#2E62A6';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,250 L24,204 Q24,168 100,166 Q176,168 176,204 L176,250 Z" fill="${scrub}" stroke="${OUT}" stroke-width="4"/>
      <path d="M76,172 L100,198 L124,172 L118,166 L100,184 L82,166 Z" fill="${scrubD}" stroke="${OUT}" stroke-width="3"/>
      <path d="M66,198 Q100,216 134,198 L134,212 Q100,230 66,212 Z" fill="#DDE7F6" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="148" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M54,102 Q54,46 100,44 Q146,46 146,102 Q146,138 127,150 Q113,159 100,159 Q87,159 73,150 Q54,138 54,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,96 Q48,34 100,30 Q152,34 150,96 Q142,66 100,62 Q58,66 50,96 Z" fill="${cap}" stroke="${OUT}" stroke-width="4"/>
      <path d="M58,78 L142,78" stroke="${OUT}" stroke-width="3" fill="none"/>
      ${brows(pose, 80, 120, 94)}
      ${eyes(pose, 80, 120, 106, '#33261B')}
      ${mouthGroups(pose, 100, 133)}
      </svg>`;
    },
  },

  pae_ems: {
    name: 'พี่เป้ กู้ชีพ',
    role: 'EMS · 1669',
    plate: ['#D14B4B', '#8F2B2B'],
    placeholder(pose) {
      const skin = '#E2A876', suit = '#D14B4B', suitD = '#8F2B2B', hair = '#22252D';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M22,250 L22,204 Q22,168 100,166 Q178,168 178,204 L178,250 Z" fill="${suit}" stroke="${OUT}" stroke-width="4"/>
      <path d="M74,172 L100,198 L126,172 L119,166 L100,184 L81,166 Z" fill="${suitD}" stroke="${OUT}" stroke-width="3"/>
      <path d="M24,214 Q100,232 176,214 L176,228 Q100,246 24,228 Z" fill="#F5C93B" stroke="${OUT}" stroke-width="3"/>
      <rect x="34" y="184" width="18" height="26" rx="4" fill="#2B2F3A" stroke="${OUT}" stroke-width="3"/>
      <path d="M40,184 L40,174" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
      <rect x="86" y="148" width="28" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M52,102 Q52,44 100,42 Q148,44 148,102 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,92 Q52,40 100,32 Q148,40 150,92 L142,90 L146,74 L132,84 L134,64 L118,78 L114,56 L100,74 L86,56 L82,78 L66,64 L68,84 L54,74 L58,90 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 96)}
      ${eyes(pose, 80, 120, 107, '#33261B')}
      ${mouthGroups(pose, 100, 134)}
      <path d="M60,120 Q58,126 62,130 M140,120 Q142,126 138,130" stroke="#C98F5E" stroke-width="2.4" fill="none"/>
      </svg>`;
    },
  },

  mind_runner: {
    name: 'น้องมายด์',
    role: 'Runner · Lab & CT',
    plate: ['#C05299', '#7E3167'],
    placeholder(pose) {
      const skin = '#F6CDA8', scrub = '#C05299', scrubD = '#93386F', hair = '#33222E';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M28,250 L28,206 Q28,172 100,170 Q172,172 172,206 L172,250 Z" fill="${scrub}" stroke="${OUT}" stroke-width="4"/>
      <path d="M76,176 L100,200 L124,176 L118,170 L100,186 L82,170 Z" fill="${scrubD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="150" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M150,52 Q168,58 164,86 Q160,112 148,128 L138,120 Q150,102 152,84 Q154,66 146,60 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M52,100 Q52,42 100,40 Q148,42 148,100 Q148,140 128,152 Q114,161 100,161 Q86,161 72,152 Q52,140 52,100 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M48,106 Q42,44 100,34 Q158,44 152,106 Q150,80 138,72 Q120,88 100,66 Q80,88 62,72 Q50,80 48,106 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <circle cx="152" cy="52" r="7" fill="#E8B4D2" stroke="${OUT}" stroke-width="3"/>
      ${brows(pose, 80, 120, 92)}
      ${eyes(pose, 80, 120, 104, '#4A3728')}
      ${mouthGroups(pose, 100, 132)}
      </svg>`;
    },
  },

  family_witness: {
    name: 'ญาติผู้ป่วย',
    role: 'Family · Witness',
    plate: ['#6E7B94', '#43506B'],
    placeholder(pose) {
      const skin = '#F1C49E', shirt = '#6E7B94', shirtD = '#43506B', hair = '#57515C';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M26,250 L26,206 Q26,170 100,168 Q174,170 174,206 L174,250 Z" fill="${shirt}" stroke="${OUT}" stroke-width="4"/>
      <path d="M80,170 Q100,182 120,170 Q114,184 100,184 Q86,184 80,170 Z" fill="${shirtD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="150" width="24" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M44,124 Q36,190 48,214 L62,206 Q54,172 60,128 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M156,124 Q164,190 152,214 L138,206 Q146,172 140,128 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M52,100 Q52,42 100,40 Q148,42 148,100 Q148,140 128,152 Q114,161 100,161 Q86,161 72,152 Q52,140 52,100 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M46,112 Q40,42 100,32 Q160,42 154,112 Q152,80 134,70 Q116,86 100,64 Q84,86 66,70 Q48,80 46,112 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <path d="M58,66 Q70,54 84,52 L80,62 Z" fill="#9BA3B5"/>
      ${brows(pose, 80, 120, 92)}
      ${eyes(pose, 80, 120, 104, '#4A3728')}
      ${mouthGroups(pose, 100, 132)}
      </svg>`;
    },
  },

  // ผู้ป่วยชายวัยกลางคนที่ยังมีสติ — ใช้กับเคสที่ผู้ป่วยพูดได้ (ACS เจ็บอก,
  // stable brady/tachy, ซักประวัติก่อนทรุด) รูปครบ 5 pose แล้ว
  patient_male: {
    name: 'ผู้ป่วยชาย',
    role: 'Patient',
    plate: ['#7FA3C4', '#4F6E8C'],
    placeholder(pose) {
      const skin = '#E8B98C', gown = '#A8C8E0', gownD = '#7FA3C4', hair = '#4A4A50', hairL = '#8E8E96';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,250 L24,206 Q24,170 100,168 Q176,170 176,206 L176,250 Z" fill="${gown}" stroke="${OUT}" stroke-width="4"/>
      <path d="M74,172 L100,200 L126,172 L118,166 L100,186 L82,166 Z" fill="${gownD}" stroke="${OUT}" stroke-width="3"/>
      <path d="M64,196 Q66,214 64,236 M136,196 Q134,214 136,236" stroke="${gownD}" stroke-width="2.6" fill="none" opacity=".7"/>
      <rect x="86" y="148" width="28" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M52,102 Q52,46 100,44 Q148,46 148,102 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,94 Q52,42 100,34 Q148,42 150,94 L140,90 Q138,62 120,58 Q104,70 100,60 Q96,70 80,60 Q62,64 60,90 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <path d="M66,52 Q82,42 100,42 M114,44 Q128,46 138,56" stroke="${hairL}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M60,122 Q58,128 62,132 M140,122 Q142,128 138,132" stroke="#C98F5E" stroke-width="2.4" fill="none"/>
      ${brows(pose, 80, 120, 96)}
      ${eyes(pose, 80, 120, 107, '#33261B')}
      ${mouthGroups(pose, 100, 134)}
      </svg>`;
    },
  },

  // ลุงผู้ป่วยสูงวัย — ใช้ซ้ำได้หลายเคส BLS นอกโรงพยาบาลที่ผู้ป่วยยังพูดได้
  // (stroke ก่อนหมดสติ, เจ็บอก, น้ำตาลต่ำ, หมดสติกลางตลาดก่อนทรุด) รูปครบ 5 pose แล้ว
  victim_uncle: {
    name: 'ลุงผู้ป่วย',
    role: 'Patient · Bystander',
    plate: ['#8E4A45', '#5C2E2A'],
    placeholder(pose) {
      const skin = '#E8B98C', shirt = '#8E4A45', shirtD = '#5C2E2A', hair = '#5A5A62';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,250 L24,206 Q24,170 100,168 Q176,170 176,206 L176,250 Z" fill="${shirt}" stroke="${OUT}" stroke-width="4"/>
      <path d="M74,172 L100,198 L126,172 L118,166 L100,186 L82,166 Z" fill="${shirtD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="86" y="150" width="28" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M52,104 Q52,48 100,46 Q148,48 148,104 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,104 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M50,96 Q52,44 100,36 Q148,44 150,96 L140,92 Q138,66 120,62 Q104,74 100,64 Q96,74 80,62 Q62,66 60,92 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 98)}
      ${eyes(pose, 80, 120, 109, '#33261B')}
      ${mouthGroups(pose, 100, 136)}
      </svg>`;
    },
  },

  // ผู้ป่วยหญิงผู้ใหญ่ที่ยังมีสติ — คู่กับ patient_male ให้โจทย์ที่ผู้ป่วยเป็นหญิง
  // (เจ็บอก, หอบหืด, แพ้ยา ฯลฯ) ไม่ต้องยืมชายวัยกลางคนมาแสดงแทน
  patient_female: {
    name: 'ผู้ป่วยหญิง',
    role: 'Patient',
    plate: ['#C48CA8', '#8E5C77'],
    placeholder(pose) {
      const skin = '#F4C9A3', gown = '#E4B0C6', gownD = '#C48CA8', hair = '#3A2E35';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,250 L24,206 Q24,170 100,168 Q176,170 176,206 L176,250 Z" fill="${gown}" stroke="${OUT}" stroke-width="4"/>
      <path d="M74,172 L100,198 L126,172 L118,166 L100,186 L82,166 Z" fill="${gownD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="87" y="150" width="26" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M42,120 Q32,196 46,220 L62,210 Q52,172 58,126 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M158,120 Q168,196 154,220 L138,210 Q148,172 142,126 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M52,102 Q52,44 100,42 Q148,44 148,102 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M46,112 Q38,44 100,34 Q162,44 154,112 Q152,78 134,68 Q116,84 100,62 Q84,84 66,68 Q48,78 46,112 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 94)}
      ${eyes(pose, 80, 120, 106, '#4A3728')}
      ${mouthGroups(pose, 100, 133)}
      </svg>`;
    },
  },

  // ผู้ป่วยหญิงตั้งครรภ์ — เคสสูติฯ/ครรภ์แก่ (เจ็บครรภ์, สำลัก, arrest ในหญิงท้อง)
  // ใช้เมื่อบทบอกชัดว่าท้องแก่/เห็นครรภ์ — ครรภ์อ่อนใช้ patient_female ปกติ
  patient_pregnant: {
    name: 'ผู้ป่วยตั้งครรภ์',
    role: 'Patient',
    plate: ['#AC8CC4', '#7C5C94'],
    placeholder(pose) {
      const skin = '#F4C9A3', gown = '#D4BCE4', gownD = '#AC8CC4', hair = '#4A382E';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M22,250 L22,208 Q22,172 100,170 Q178,172 178,208 L178,250 Z" fill="${gown}" stroke="${OUT}" stroke-width="4"/>
      <path d="M48,250 Q42,216 100,212 Q158,216 152,250 Z" fill="${gownD}" stroke="${OUT}" stroke-width="3" opacity=".55"/>
      <path d="M74,174 L100,198 L126,174 L118,168 L100,188 L82,168 Z" fill="${gownD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="87" y="150" width="26" height="26" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M46,118 Q40,178 50,200 L64,192 Q56,166 60,124 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M154,118 Q160,178 150,200 L136,192 Q144,166 140,124 Z" fill="${hair}" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M52,102 Q52,44 100,42 Q148,44 148,102 Q148,140 128,152 Q114,160 100,160 Q86,160 72,152 Q52,140 52,102 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M46,110 Q40,44 100,34 Q160,44 154,110 Q150,76 132,68 Q114,84 100,62 Q86,84 68,68 Q50,76 46,110 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      ${brows(pose, 80, 120, 94)}
      ${eyes(pose, 80, 120, 106, '#3E2E22')}
      ${mouthGroups(pose, 100, 133)}
      </svg>`;
    },
  },

  // ผู้ป่วยเด็ก (ประถม-วัยรุ่นตอนต้น) — เคสเด็กที่ยังพูดได้ (หอบหืด, สำลัก,
  // ซักประวัติก่อนทรุด) ทารก/เด็กเล็กที่พูดไม่ได้ให้ family_witness เล่าแทน
  patient_child: {
    name: 'ผู้ป่วยเด็ก',
    role: 'Patient',
    plate: ['#E0A845', '#A87A24'],
    placeholder(pose) {
      const skin = '#F6CFA8', shirt = '#F0C048', shirtD = '#C89A2E', hair = '#33291F';
      return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <path d="M38,250 L38,214 Q38,184 100,182 Q162,184 162,214 L162,250 Z" fill="${shirt}" stroke="${OUT}" stroke-width="4"/>
      <path d="M80,186 L100,204 L120,186 L114,180 L100,192 L86,180 Z" fill="${shirtD}" stroke="${OUT}" stroke-width="3"/>
      <rect x="89" y="164" width="22" height="24" fill="${skin}" stroke="${OUT}" stroke-width="3.4"/>
      <path d="M50,110 Q50,48 100,46 Q150,48 150,110 Q150,148 130,161 Q115,170 100,170 Q85,170 70,161 Q50,148 50,110 Z" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
      <path d="M48,104 Q48,46 100,38 Q152,46 152,104 Q148,74 130,68 Q112,82 100,64 Q88,82 70,68 Q52,74 48,104 Z" fill="${hair}" stroke="${OUT}" stroke-width="4"/>
      <path d="M92,40 Q98,30 108,34 L104,42 Z" fill="${hair}" stroke="${OUT}" stroke-width="3"/>
      ${brows(pose, 79, 121, 100)}
      ${eyes(pose, 79, 121, 113, '#3A2A1A')}
      ${mouthGroups(pose, 100, 141)}
      </svg>`;
    },
  },
};

// ตัวละคร custom ที่แอดมินสร้าง (โหลดจาก Supabase ตอนเข้าเกม) — merge ทับ/เพิ่มจาก built-in
// entry แบบ custom มี images:{pose:url} ให้ CharacterSprite ใช้ก่อน ถ้าไม่มีก็ SVG generic
let customCharacters = {};

export function registerCustomCharacters(map) {
  customCharacters = map || {};
}

// SVG placeholder กลาง สำหรับตัวละคร custom ที่ยังไม่มีรูปครบทุกท่า
function genericPlaceholder(entry) {
  const coat = entry?.plate?.[0] || '#405089';
  const coatD = entry?.plate?.[1] || '#232F5E';
  return (pose) => `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
    <path d="M24,250 L24,206 Q24,170 100,168 Q176,170 176,206 L176,250 Z" fill="${coat}" stroke="${OUT}" stroke-width="4"/>
    <path d="M76,174 L100,200 L124,174 L118,168 L100,186 L82,168 Z" fill="${coatD}" stroke="${OUT}" stroke-width="3"/>
    <rect x="88" y="150" width="24" height="26" fill="#EDBE96" stroke="${OUT}" stroke-width="3.4"/>
    <ellipse cx="100" cy="100" rx="46" ry="52" fill="#EDBE96" stroke="${OUT}" stroke-width="4"/>
    <path d="M52,96 Q56,42 100,38 Q144,42 148,96 Q144,66 128,62 Q110,74 100,60 Q90,74 72,62 Q56,66 52,96 Z" fill="#3A3F4B" stroke="${OUT}" stroke-width="4"/>
    ${brows(pose, 79, 121, 90)}
    ${eyes(pose, 79, 121, 104, '#3A3228')}
    ${mouthGroups(pose, 100, 132)}
  </svg>`;
}

export function getCharacter(charId) {
  if (customCharacters[charId]) {
    const entry = customCharacters[charId];
    // ให้มี placeholder เสมอ เผื่อบางท่ายังไม่มีรูป
    return { ...entry, placeholder: entry.placeholder || genericPlaceholder(entry) };
  }
  if (CHARACTERS[charId]) return CHARACTERS[charId];
  if (!charId) return null;
  // ตัวละครที่ยังไม่รู้จัก (เช่น custom ที่ยังโหลดไม่เสร็จ) → silhouette กลาง กัน "หน้าหาย"
  const fallback = { name: '—', role: '', plate: ['#405089', '#232F5E'], custom: true };
  return { ...fallback, placeholder: genericPlaceholder(fallback) };
}

// URL รูปจริง: custom ใช้ URL จาก DB (entry.images), built-in ใช้ path local
export function characterImageUrl(charId, pose, talking = false) {
  const custom = customCharacters[charId];
  if (custom) {
    // custom ยังไม่รองรับเฟรมปากอ้างแยก — คืน URL ของ pose ตรงๆ (หรือ null ถ้าไม่มี)
    return talking ? null : (custom.images?.[pose] || null);
  }
  return `/images/characters/${charId}/${pose}${talking ? '_talk' : ''}.webp`;
}
