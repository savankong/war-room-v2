'use client';
import React, { useId } from 'react';

export const AEGIS_COLORS = {
  navy: '#1B2738',
  blue: '#2563B8',
  blueLight: '#5B9BE8',
  slate: '#5A6B82',
  grey: '#8995A4',
  paper: '#F3F2EE',
  ink: '#16202E',
};

function ShieldColor({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={uid + 'L'} x1="26" y1="30" x2="120" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E0E7F0" /><stop offset="0.5" stopColor="#A9B4C2" /><stop offset="1" stopColor="#737F90" />
        </linearGradient>
        <linearGradient id={uid + 'R'} x1="100" y1="34" x2="174" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6FA8EC" /><stop offset="0.55" stopColor="#2F6FC4" /><stop offset="1" stopColor="#1B4E96" />
        </linearGradient>
      </defs>
      <polygon points="26,34 100,34 100,216 26,112" fill={`url(#${uid}L)`} />
      <polygon points="100,34 174,34 174,112 100,216" fill={`url(#${uid}R)`} />
      <polygon points="42,48 100,48 100,126 42,108" fill="#3A5078" />
      <polygon points="100,48 158,48 158,108 100,126" fill="#2A3D62" />
      <polygon points="42,108 100,126 100,194" fill="#202F4C" />
      <polygon points="158,108 100,126 100,194" fill="#141E32" />
      <line x1="100" y1="48" x2="100" y2="194" stroke="#9BC2F0" strokeWidth="1.6" opacity="0.5" />
      <polyline points="42,106 100,124 158,106" fill="none" stroke="#9BC2F0" strokeWidth="1.4" strokeLinejoin="round" opacity="0.25" />
      <polyline points="42,108 100,126 158,108" fill="none" stroke="#0C1422" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
      <line x1="46" y1="49.5" x2="154" y2="49.5" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.28" />
      <polygon points="26,34 174,34 174,112 100,216 26,112" fill="none" stroke="#080E18" strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  );
}

interface AegisMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

export function AegisMark({ size = 40, title = 'War Room', style, ...rest }: AegisMarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={size} height={Math.round(size * 232 / 200)} viewBox="0 0 200 232" fill="none"
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}
         style={{ display: 'block', ...style }} {...rest}>
      <ShieldColor uid={uid} />
    </svg>
  );
}

interface AegisIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

export function AegisIcon({ size = 40, title = 'War Room', style, ...rest }: AegisIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none"
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}
         style={{ display: 'block', ...style }} {...rest}>
      <rect x="0" y="0" width="512" height="512" rx={512 * 0.225} fill={AEGIS_COLORS.navy} />
      <g transform="translate(126.7,100) scale(1.2931)"><ShieldColor uid={uid} /></g>
    </svg>
  );
}

interface AegisLockupProps {
  height?: number;
  theme?: 'light' | 'dark';
  tagline?: boolean;
  style?: React.CSSProperties;
}

export function AegisLockup({ height = 40, theme = 'light', tagline = true, style }: AegisLockupProps) {
  const dark = theme === 'dark';
  const nameColor = dark ? '#FFFFFF' : AEGIS_COLORS.ink;
  const tagColor  = dark ? '#9BB0C6' : AEGIS_COLORS.slate;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.4, ...style }}>
      <AegisMark size={Math.round(height * (200 / 232) * 1.18)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: height * 0.12 }}>
        <span style={{ fontFamily: "Archivo, 'Arial Black', sans-serif", fontWeight: 800,
                       fontSize: height * 0.92, letterSpacing: '0.5px', lineHeight: 1, color: nameColor }}>
          WAR ROOM
        </span>
        {tagline && (
          <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontWeight: 500,
                         fontSize: Math.max(9, height * 0.26), letterSpacing: '2.2px',
                         textTransform: 'uppercase', color: tagColor, whiteSpace: 'nowrap' }}>
            Business Intelligence · Dept. of War
          </span>
        )}
      </div>
    </div>
  );
}

export default AegisMark;
