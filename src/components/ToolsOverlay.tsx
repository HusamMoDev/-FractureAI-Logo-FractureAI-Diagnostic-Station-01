import React, { useState } from 'react';
import { CaliperMeasurement, AngleMeasurement, MeasurementPoint } from '../types';

interface ToolsOverlayProps {
  isMeasurementActive: boolean;
  isAngleActive: boolean;
  onCloseTools: () => void;
}

export const ToolsOverlay: React.FC<ToolsOverlayProps> = ({
  isMeasurementActive,
  isAngleActive,
  onCloseTools,
}) => {
  const [calipers, setCalipers] = useState<CaliperMeasurement[]>([
    {
      id: 'm1',
      p1: { x: 120, y: 150 },
      p2: { x: 260, y: 150 },
      distanceMm: 24.8,
    },
  ]);

  const [angles, setAngles] = useState<AngleMeasurement[]>([
    {
      id: 'a1',
      p1: { x: 150, y: 120 },
      p2: { x: 210, y: 180 },
      p3: { x: 270, y: 140 },
      angleDegrees: 18.2,
    },
  ]);

  const [clickStep, setClickStep] = useState<MeasurementPoint[]>([]);

  if (!isMeasurementActive && !isAngleActive) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isMeasurementActive) {
      if (clickStep.length === 0) {
        setClickStep([{ x, y }]);
      } else {
        const p1 = clickStep[0];
        const p2 = { x, y };
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const distanceMm = parseFloat((distPx * 0.15).toFixed(1));

        setCalipers([...calipers, { id: Date.now().toString(), p1, p2, distanceMm }]);
        setClickStep([]);
      }
    } else if (isAngleActive) {
      if (clickStep.length < 2) {
        setClickStep([...clickStep, { x, y }]);
      } else {
        const p1 = clickStep[0];
        const p2 = clickStep[1];
        const p3 = { x, y };

        // Angle calculation at p2
        const rad1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const rad2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        let deg = Math.abs((rad1 - rad2) * (180 / Math.PI));
        if (deg > 180) deg = 360 - deg;

        setAngles([...angles, { id: Date.now().toString(), p1, p2, p3, angleDegrees: parseFloat(deg.toFixed(1)) }]);
        setClickStep([]);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-40 pointer-events-auto">
      {/* Tool Hint Banner */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#00b4db] text-[#003543] font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2 z-50">
        <span className="material-symbols-outlined text-sm">
          {isMeasurementActive ? 'straighten' : 'square_foot'}
        </span>
        <span>
          {isMeasurementActive
            ? 'Click 2 points to measure bone length (mm)'
            : 'Click 3 points to measure angulation (degrees)'}
        </span>
        <button
          onClick={onCloseTools}
          className="ml-2 bg-[#003543]/20 hover:bg-[#003543]/40 rounded-full w-4 h-4 flex items-center justify-center text-xs"
        >
          ×
        </button>
      </div>

      {/* SVG Canvas for overlays */}
      <svg
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Render Calipers */}
        {calipers.map((c) => (
          <g key={c.id}>
            <line
              x1={c.p1.x}
              y1={c.p1.y}
              x2={c.p2.x}
              y2={c.p2.y}
              stroke="#00B4DB"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx={c.p1.x} cy={c.p1.y} r="4" fill="#00B4DB" />
            <circle cx={c.p2.x} cy={c.p2.y} r="4" fill="#00B4DB" />
            <rect
              x={(c.p1.x + c.p2.x) / 2 - 25}
              y={(c.p1.y + c.p2.y) / 2 - 12}
              width="50"
              height="20"
              rx="4"
              fill="#003543"
              stroke="#00B4DB"
            />
            <text
              x={(c.p1.x + c.p2.x) / 2}
              y={(c.p1.y + c.p2.y) / 2 + 2}
              fill="#4cd6fe"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {c.distanceMm} mm
            </text>
          </g>
        ))}

        {/* Render Angles */}
        {angles.map((a) => (
          <g key={a.id}>
            <polyline
              points={`${a.p1.x},${a.p1.y} ${a.p2.x},${a.p2.y} ${a.p3.x},${a.p3.y}`}
              fill="none"
              stroke="#ffb4ab"
              strokeWidth="2"
            />
            <circle cx={a.p1.x} cy={a.p1.y} r="4" fill="#ffb4ab" />
            <circle cx={a.p2.x} cy={a.p2.y} r="5" fill="#ffb4ab" />
            <circle cx={a.p3.x} cy={a.p3.y} r="4" fill="#ffb4ab" />
            <rect
              x={a.p2.x - 25}
              y={a.p2.y - 25}
              width="50"
              height="20"
              rx="4"
              fill="#3e0002"
              stroke="#ffb4ab"
            />
            <text
              x={a.p2.x}
              y={a.p2.y - 11}
              fill="#ffb4ab"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {a.angleDegrees}°
            </text>
          </g>
        ))}

        {/* Render Click Step Points */}
        {clickStep.map((pt, idx) => (
          <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#4cd6fe" className="animate-ping" />
        ))}
      </svg>
    </div>
  );
};
