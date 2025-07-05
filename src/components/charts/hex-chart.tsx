'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DomainScore } from '@/lib/score-calculator';
import {
  calculateHexVertex,
  calculateReferenceHexagon,
  generatePolygonPath,
  generatePolygonPoints,
  getScoreColor,
  getTextAnchor,
  HexCoordinate
} from '@/lib/hex-chart-utils';

interface HexChartProps {
  domainScores: DomainScore[];
  size?: number;
  className?: string;
  onDomainClick?: (domainId: number) => void;
}

interface HexDataPoint extends HexCoordinate {
  percentage: number;
  domainName: string;
  domainId: number;
  color: string;
}

export default function HexChart({ 
  domainScores, 
  size = 400, 
  className = '',
  onDomainClick 
}: HexChartProps) {
  const [hoveredDomain, setHoveredDomain] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const center: HexCoordinate = { x: size / 2, y: size / 2 };
  const maxRadius = size * 0.35; // Leave margin for labels
  const labelRadius = size * 0.45; // Outside the chart area

  // Calculate data points
  const dataPoints: HexDataPoint[] = domainScores.map((domain, index) => {
    const radius = (domain.percentage / 100) * maxRadius;
    const coord = calculateHexVertex(center, radius, index);
    
    return {
      ...coord,
      percentage: domain.percentage,
      domainName: domain.domainName,
      domainId: domain.domainId,
      color: getScoreColor(domain.percentage)
    };
  });

  // Calculate label positions
  const labelPositions = domainScores.map((domain, index) => {
    const coord = calculateHexVertex(center, labelRadius, index);
    return {
      ...coord,
      domainName: domain.domainName,
      domainId: domain.domainId,
      percentage: domain.percentage,
      textAnchor: getTextAnchor(coord.x, center.x)
    };
  });

  // Generate background grid hexagons
  const backgroundHexagons = [20, 40, 60, 80, 100].map(percent => {
    const radius = maxRadius * (percent / 100);
    const points = calculateReferenceHexagon(center, radius);
    return { percent, points: generatePolygonPoints(points) };
  });

  // Generate grid lines
  const gridLines = Array.from({ length: 6 }, (_, index) => {
    const endPoint = calculateHexVertex(center, maxRadius, index);
    return { start: center, end: endPoint };
  });

  const chartPath = generatePolygonPath(dataPoints);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="Coaching assessment results hexagonal chart"
      >
        {/* Background grid hexagons */}
        <g className="opacity-20">
          {backgroundHexagons.map(({ percent, points }) => (
            <polygon
              key={percent}
              points={points}
              fill="none"
              stroke="#6b7280"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Grid lines from center to vertices */}
        <g className="opacity-20">
          {gridLines.map((line, index) => (
            <line
              key={index}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#6b7280"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Gradient definition */}
        <defs>
          <radialGradient id="hexGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Data area */}
        <motion.path
          d={chartPath}
          fill="url(#hexGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: isAnimated ? 1 : 0, 
            opacity: isAnimated ? 0.7 : 0 
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <motion.circle
            key={`point-${point.domainId}`}
            cx={point.x}
            cy={point.y}
            r={hoveredDomain === point.domainId ? 8 : 6}
            fill={point.color}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
            onMouseEnter={() => setHoveredDomain(point.domainId)}
            onMouseLeave={() => setHoveredDomain(null)}
            onClick={() => onDomainClick?.(point.domainId)}
            role="button"
            aria-label={`${point.domainName}: ${point.percentage.toFixed(1)}%`}
          />
        ))}

        {/* Domain labels */}
        {labelPositions.map((label, index) => (
          <g key={`label-${label.domainId}`}>
            <motion.text
              x={label.x}
              y={label.y}
              textAnchor={label.textAnchor as 'start' | 'middle' | 'end'}
              dominantBaseline="central"
              className="text-xs font-medium fill-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
            >
              {label.domainName}
            </motion.text>
            <motion.text
              x={label.x}
              y={label.y + 12}
              textAnchor={label.textAnchor as 'start' | 'middle' | 'end'}
              dominantBaseline="central"
              className="text-xs font-bold fill-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 1.2, duration: 0.3 }}
            >
              {label.percentage.toFixed(0)}%
            </motion.text>
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredDomain && (
        <motion.div
          className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: '50%',
            top: '10px',
            transform: 'translateX(-50%)'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {(() => {
            const domain = domainScores.find(d => d.domainId === hoveredDomain);
            if (!domain) return null;
            
            return (
              <div className="text-center">
                <div className="font-semibold text-gray-900">{domain.domainName}</div>
                <div className="text-sm text-gray-600">
                  {domain.score} / {domain.maxScore} points
                </div>
                <div className="text-sm font-medium" style={{ color: getScoreColor(domain.percentage) }}>
                  {domain.percentage.toFixed(1)}%
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
