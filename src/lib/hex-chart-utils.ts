/**
 * Utility functions for hexagonal chart calculations
 */

export interface HexCoordinate {
  x: number;
  y: number;
}

/**
 * Calculate coordinates for a point on a hexagon
 * @param center - Center point of the hexagon
 * @param radius - Distance from center
 * @param angleIndex - Index (0-5) representing which vertex
 * @returns Coordinate object with x, y
 */
export function calculateHexVertex(
  center: HexCoordinate,
  radius: number,
  angleIndex: number
): HexCoordinate {
  // Start from top and go clockwise (angle 0 = top)
  const angle = (angleIndex * 60 - 90) * (Math.PI / 180);
  
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle)
  };
}

/**
 * Generate SVG path string for a polygon
 * @param points - Array of coordinate points
 * @returns SVG path string
 */
export function generatePolygonPath(points: HexCoordinate[]): string {
  if (points.length === 0) return '';
  
  const pathCommands = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x} ${point.y}`;
  });
  
  pathCommands.push('Z'); // Close the path
  return pathCommands.join(' ');
}

/**
 * Generate points string for SVG polygon element
 * @param points - Array of coordinate points
 * @returns Points string for polygon
 */
export function generatePolygonPoints(points: HexCoordinate[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ');
}

/**
 * Calculate color based on percentage score
 * @param percentage - Score percentage (0-100)
 * @returns Hex color string
 */
export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return '#10b981'; // Green - Excellent
  if (percentage >= 60) return '#f59e0b'; // Yellow - Good  
  if (percentage >= 40) return '#f97316'; // Orange - Fair
  return '#ef4444'; // Red - Needs improvement
}

/**
 * Calculate optimal text anchor based on position
 * @param x - X coordinate
 * @param centerX - Center X coordinate
 * @returns Text anchor value
 */
export function getTextAnchor(x: number, centerX: number): string {
  const threshold = centerX * 0.1; // 10% threshold
  
  if (x < centerX - threshold) return 'end';
  if (x > centerX + threshold) return 'start';
  return 'middle';
}

/**
 * Calculate reference hexagon points for background grid
 * @param center - Center coordinate
 * @param radius - Radius of the hexagon
 * @returns Array of 6 hex vertex coordinates
 */
export function calculateReferenceHexagon(
  center: HexCoordinate,
  radius: number
): HexCoordinate[] {
  return Array.from({ length: 6 }, (_, index) => 
    calculateHexVertex(center, radius, index)
  );
}
