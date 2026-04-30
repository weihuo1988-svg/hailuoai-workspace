import type { IconType } from '../lib/types';

interface DoodleIconProps {
  type: IconType;
  size?: number;
  completed?: boolean;
  className?: string;
}

const iconPaths: Record<IconType, { path: string; fill: string }> = {
  forest: {
    path: 'M20 35 L12 20 L16 22 L10 12 L14 14 L17 5 L23 5 L26 14 L30 12 L24 22 L28 20 L20 35 Z',
    fill: 'hsl(145, 60%, 45%)',
  },
  bridge: {
    path: 'M5 25 Q10 15 20 15 Q30 15 35 25 M5 25 L5 30 M35 25 L35 30 M10 20 L10 30 M20 15 L20 30 M30 20 L30 30',
    fill: 'hsl(28, 40%, 45%)',
  },
  animal: {
    path: 'M14 12 Q14 6 18 8 L20 5 L22 8 Q26 6 26 12 Q28 14 28 18 Q28 26 20 28 Q12 26 12 18 Q12 14 14 12 Z M16 16 A1.5 1.5 0 1 0 17 16 M23 16 A1.5 1.5 0 1 0 24 16 M18 20 Q20 23 22 20',
    fill: 'hsl(24, 90%, 58%)',
  },
  mountain: {
    path: 'M5 35 L15 10 L20 20 L25 8 L35 35 Z M22 8 L25 14 L28 10',
    fill: 'hsl(200, 30%, 55%)',
  },
  lake: {
    path: 'M5 20 Q10 12 20 12 Q30 12 35 20 Q30 28 20 28 Q10 28 5 20 Z M10 22 Q15 18 20 22 M22 18 Q27 14 32 18',
    fill: 'hsl(200, 80%, 55%)',
  },
  castle: {
    path: 'M10 35 L10 15 L8 15 L8 10 L12 10 L12 15 L18 15 L18 10 L22 10 L22 15 L28 15 L28 10 L32 10 L32 15 L30 15 L30 35 M17 35 L17 25 Q20 22 23 25 L23 35',
    fill: 'hsl(340, 75%, 65%)',
  },
  playground: {
    path: 'M8 35 L15 15 L30 15 L30 35 M15 15 L8 35 M15 20 L30 20 M15 25 L30 25 M22 15 L22 10 L32 10 L32 15',
    fill: 'hsl(42, 92%, 56%)',
  },
  temple: {
    path: 'M20 5 L35 15 L5 15 Z M8 15 L8 30 M32 30 L32 15 M14 15 L14 30 M20 15 L20 30 M26 15 L26 30 M5 30 L35 30 L35 35 L5 35 Z',
    fill: 'hsl(0, 60%, 55%)',
  },
  flower: {
    path: 'M20 18 A5 5 0 1 0 20 8 A5 5 0 1 0 28 14 A5 5 0 1 0 25 23 A5 5 0 1 0 15 23 A5 5 0 1 0 12 14 A5 5 0 1 0 20 18 Z M20 22 L20 35 M16 28 L20 25 M24 30 L20 27',
    fill: 'hsl(340, 70%, 60%)',
  },
  lighthouse: {
    path: 'M17 35 L15 15 L12 15 L20 3 L28 15 L25 15 L23 35 Z M17 20 L23 20 M17 25 L23 25 M19 10 A1.5 1.5 0 1 0 21 10',
    fill: 'hsl(42, 80%, 50%)',
  },
};

export function DoodleIcon({ type, size = 40, completed = false, className = '' }: DoodleIconProps) {
  const icon = iconPaths[type];
  const strokeColor = completed ? icon.fill : 'hsl(28, 20%, 65%)';
  const fillOpacity = completed ? 0.2 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`${className} ${completed ? 'animate-pop-in' : ''}`}
    >
      <path
        d={icon.path}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={completed ? icon.fill : 'none'}
        fillOpacity={fillOpacity}
        style={{
          strokeDasharray: completed ? 'none' : '4 3',
        }}
      />
    </svg>
  );
}
