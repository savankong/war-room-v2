'use client';

/* War Room logo — crosshair targeting mark */
export function WRMark({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  const bg = dark ? '#0f1623' : '#1B2738';
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="14" stroke="#c8502d" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <circle cx="15" cy="15" r="10" stroke="#c8502d" strokeWidth="1.5" fill="none" opacity="0.55"/>
      <circle cx="15" cy="15" r="6"  stroke="#c8502d" strokeWidth="1.5" fill="none" opacity="0.7"/>
      <circle cx="15" cy="15" r="3"  fill="#c8502d"/>
      <circle cx="20" cy="10" r="2.5" fill="#e0a32e"/>
      <line x1="15" y1="15" x2="20" y2="10" stroke={bg} strokeWidth="1.5"/>
    </svg>
  );
}

export function WRMarkNavy({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 232 / 200} viewBox="0 0 200 232" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wrl" x1="26" y1="30" x2="120" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E0E7F0"/><stop offset="0.5" stopColor="#A9B4C2"/><stop offset="1" stopColor="#737F90"/>
        </linearGradient>
        <linearGradient id="wrr" x1="100" y1="34" x2="174" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6FA8EC"/><stop offset="0.55" stopColor="#2F6FC4"/><stop offset="1" stopColor="#1B4E96"/>
        </linearGradient>
      </defs>
      <polygon points="26,34 100,34 100,216 26,112" fill="url(#wrl)"/>
      <polygon points="100,34 174,34 174,112 100,216" fill="url(#wrr)"/>
      <polygon points="42,48 100,48 100,126 42,108" fill="#3A5078"/>
      <polygon points="100,48 158,48 158,108 100,126" fill="#2A3D62"/>
      <polygon points="42,108 100,126 100,194" fill="#202F4C"/>
      <polygon points="158,108 100,126 100,194" fill="#141E32"/>
      <line x1="100" y1="48" x2="100" y2="194" stroke="#9BC2F0" strokeWidth="1.6" opacity="0.5"/>
      <polyline points="42,108 100,126 158,108" fill="none" stroke="#0C1422" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55"/>
      <polygon points="26,34 174,34 174,112 100,216 26,112" fill="none" stroke="rgba(8,14,24,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function WRWordmark({ size = 24, color = '#f1ece2', accent = '#c8502d' }: { size?: number; color?: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontFamily: 'Archivo, IBM Plex Sans, sans-serif', fontWeight: 800, fontSize: size, letterSpacing: '-0.01em', lineHeight: 1, color }}>
        WAR <span style={{ color: accent }}>ROOM</span>
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: Math.max(8, size * 0.26), letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
        Defense Intelligence
      </div>
    </div>
  );
}
