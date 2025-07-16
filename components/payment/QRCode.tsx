import React from 'react';
import { View, StyleSheet } from 'react-native';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

// Simple QR code implementation for demo purposes
// In a real app, you would use a library like react-native-qrcode-svg
export default function QRCode({ 
  value, 
  size = 200, 
  color = '#000000', 
  backgroundColor = '#ffffff' 
}: QRCodeProps) {
  // Generate a deterministic pattern based on the value string
  const generatePattern = () => {
    // Create a simple hash of the string
    const hash = value.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    // Generate a 25x25 matrix (typical QR code size)
    const matrix = Array(25).fill(0).map(() => Array(25).fill(0));
    
    // Fill the matrix with a pattern based on the hash
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Always fill the corner squares (QR code finder patterns)
        if ((i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7)) {
          if ((i > 1 && i < 5 && j > 1 && j < 5) || 
              (i > 1 && i < 5 && j > 19 && j < 23) || 
              (i > 19 && i < 23 && j > 1 && j < 5)) {
            matrix[i][j] = 1;
          } else if (i === 0 || i === 6 || i === 18 || i === 24 || 
                     j === 0 || j === 6 || j === 18 || j === 24) {
            matrix[i][j] = 1;
          }
        } else {
          // Use the hash to determine if a cell should be filled
          const cellHash = (hash + (i * 25 + j)) % 100;
          matrix[i][j] = cellHash < 40 ? 1 : 0;
        }
      }
    }
    
    return matrix;
  };
  
  const pattern = generatePattern();
  const cellSize = size / 25;
  
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      {pattern.map((row, i) => (
        row.map((cell, j) => (
          cell ? (
            <View 
              key={`${i}-${j}`} 
              style={[
                styles.cell, 
                { 
                  width: cellSize, 
                  height: cellSize, 
                  backgroundColor: color,
                  top: i * cellSize,
                  left: j * cellSize,
                }
              ]} 
            />
          ) : null
        ))
      ))}
      
      {/* BlockDAG logo in the center */}
      <View style={[styles.logo, { width: size * 0.2, height: size * 0.2 }]}>
        <View style={[styles.logoInner, { backgroundColor: '#6366f1' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
  },
  logo: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: '80%',
    height: '80%',
    borderRadius: 4,
  },
});