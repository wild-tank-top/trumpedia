"use client";

import { Activity } from "lucide-react";

type DayStat = { date: string; count: number };

const W = 360;
const H = 72;
const PAD_X = 0;
const PAD_TOP = 8;
const PAD_BOTTOM = 20; // space for day labels
const CHART_H = H - PAD_TOP - PAD_BOTTOM;

export default function ResonanceGraph({ stats }: { stats: DayStat[] }) {
  const max = Math.max(...stats.map((s) => s.count), 1);
  const step = (W - PAD_X * 2) / (stats.length - 1);

  const points = stats.map((s, i) => ({
    x: PAD_X + i * step,
    y: PAD_TOP + CHART_H - (s.count / max) * CHART_H,
    count: s.count,
    date: s.date,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + CHART_H).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD_TOP + CHART_H).toFixed(1)} Z`;

  const totalSessions = stats.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Global Resonance</h2>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            直近7日間の回答数
          </span>
        </div>
        <span className="text-xs font-semibold text-indigo-600">
          {totalSessions}
          <span className="font-normal text-gray-400 ml-0.5">件</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="none"
        className="overflow-visible"
        style={{ height: 72 }}
      >
        <defs>
          <linearGradient id="resonance-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 塗りつぶし */}
        <path d={areaPath} fill="url(#resonance-grad)" />

        {/* ライン */}
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* データポイント */}
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="white"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
        ))}

        {/* 日付ラベル */}
        {points.map((p) => (
          <text
            key={`label-${p.date}`}
            x={p.x}
            y={H - 2}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
          >
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  );
}
