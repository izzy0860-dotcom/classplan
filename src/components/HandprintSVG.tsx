import React from 'react';

interface HandprintSVGProps {
  color?: string;
  size?: number;
  angle?: number;
  handType?: 'left' | 'right';
  className?: string;
}

export const HandprintSVG: React.FC<HandprintSVGProps> = ({
  color = '#DC2626',
  size = 120,
  angle = 0,
  handType = 'right',
  className = '',
}) => {
  const isLeft = handType === 'left';

  return (
    <div
      className={`inline-block transition-transform ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${angle}deg) ${isLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
      }}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-sm filter"
        style={{ fill: color }}
      >
        {/* Palm base with organic ink texture */}
        <path
          d="M 28 65 C 26 50, 72 50, 72 65 C 75 80, 68 105, 50 108 C 32 105, 25 80, 28 65 Z"
          opacity="0.88"
        />

        {/* Thumb */}
        <ellipse
          cx="17"
          cy="60"
          rx="9"
          ry="15"
          transform="rotate(-35 17 60)"
          opacity="0.92"
        />
        <circle cx="11" cy="50" r="7" opacity="0.95" />

        {/* Index Finger */}
        <ellipse
          cx="33"
          cy="32"
          rx="7.5"
          ry="20"
          transform="rotate(-8 33 32)"
          opacity="0.92"
        />
        <circle cx="31" cy="14" r="6.5" opacity="0.96" />

        {/* Middle Finger */}
        <ellipse
          cx="50"
          cy="26"
          rx="8"
          ry="22"
          transform="rotate(0 50 26)"
          opacity="0.92"
        />
        <circle cx="50" cy="7" r="7" opacity="0.96" />

        {/* Ring Finger */}
        <ellipse
          cx="67"
          cy="32"
          rx="7.5"
          ry="20"
          transform="rotate(8 67 32)"
          opacity="0.92"
        />
        <circle cx="69" cy="14" r="6.5" opacity="0.96" />

        {/* Little Finger (Pinky) */}
        <ellipse
          cx="82"
          cy="44"
          rx="6.5"
          ry="16"
          transform="rotate(18 82 44)"
          opacity="0.90"
        />
        <circle cx="86" cy="30" r="5.5" opacity="0.95" />

        {/* Organic hand stamp ink splatters / dots */}
        <circle cx="50" cy="75" r="3" fill="#FFFFFF" opacity="0.25" />
        <circle cx="42" cy="85" r="2" fill="#FFFFFF" opacity="0.25" />
        <circle cx="58" cy="82" r="2.5" fill="#FFFFFF" opacity="0.25" />
      </svg>
    </div>
  );
};
