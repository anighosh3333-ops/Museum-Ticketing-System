import React from 'react';

/**
 * High-fidelity SVG QR Code component that renders a realistic QR pattern
 * with corner position markers, timing tracks, pseudo-random payload grid,
 * and a luxury gold emblem at the center.
 */
export default function QRCode({ value = 'AUR-PASS-VALID', size = 160 }) {
  // Generate a deterministic 21x21 matrix based on the value string
  const gridSize = 21;
  const matrix = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

  // Helper to mark 7x7 corner finder patterns
  const setFinderPattern = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer box
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner center box
        ) {
          matrix[startRow + r][startCol + c] = true;
        } else {
          matrix[startRow + r][startCol + c] = false;
        }
      }
    }
  };

  // Set 3 position detection patterns
  setFinderPattern(0, 0);                    // Top-Left
  setFinderPattern(0, gridSize - 7);         // Top-Right
  setFinderPattern(gridSize - 7, 0);         // Bottom-Left

  // Timing patterns (horizontal and vertical line with alternating dots)
  for (let i = 8; i < gridSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Populate data area deterministically from string hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite corner finder patterns or center logo space
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const inCenter = r >= 9 && r <= 11 && c >= 9 && c <= 11;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
        // pseudo-random bit using hash + coordinate
        const pseudo = Math.sin((r * 31 + c * 17) + Math.abs(hash)) * 10000;
        matrix[r][c] = (pseudo - Math.floor(pseudo)) > 0.45;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className="qr-container" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="qr-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={size} height={size} fill="#ffffff" rx="8" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize * 0.95}
                height={cellSize * 0.95}
                rx={1}
                fill="#121216"
              />
            ) : null
          )
        )}
        {/* Center Museum Crest */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={cellSize * 2.2}
          fill="#0D1D1A"
          stroke="#B89A68"
          strokeWidth="1.5"
        />
        <text
          x={size / 2}
          y={size / 2 + 3.5}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#F1E8D8"
          fontFamily="system-ui, sans-serif"
        >
          AUR
        </text>
      </svg>
    </div>
  );
}
