import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DeployedObject } from '@/types/database';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface Agent3DObjectProps {
  agent: DeployedObject;
  size?: number;
  isInRange?: boolean;
  distance?: number;
  onPress?: () => void;
}

export default function Agent3DObject({ agent, size = 50, isInRange = false, distance = 0, onPress }: Agent3DObjectProps) {
  const rotateY = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);
  
  // Get object type and color based on agent type
  const objectType = getObjectTypeFromAgentType(agent.object_type);
  const objectColor = getAgentColor(agent.object_type);
  
  // Calculate dynamic size based on distance
  const dynamicSize = size * Math.max(0.5, Math.min(1.5, 1 - (distance / 100) * 0.5));
  
  // Start rotation animation immediately
  useEffect(() => {
    // Rotate Y axis (horizontal spin)
    rotateY.value = withRepeat(
      withTiming(360, { 
        duration: isInRange ? 6000 : 8000 + Math.random() * 4000, // Faster rotation when in range
        easing: Easing.linear 
      }),
      -1, // Infinite repetitions
      false // Don't reverse
    );
    
    // Slight tilt on X axis
    rotateX.value = withRepeat(
      withTiming(15, { 
        duration: isInRange ? 4000 : 6000 + Math.random() * 3000,
        easing: Easing.inOut(Easing.sine) 
      }),
      -1, // Infinite repetitions
      true // Reverse (back and forth)
    );
    
    // Add pulse effect when in range
    if (isInRange) {
      scaleAnim.value = withRepeat(
        withTiming(1.15, { 
          duration: 800,
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );
      
      // Add pulsing opacity for in-range objects
      opacityAnim.value = withRepeat(
        withTiming(0.85, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      );
    } else {
      scaleAnim.value = withTiming(1, { duration: 300 });
      opacityAnim.value = withTiming(
        // Fade out distant objects
        distance > 80 ? interpolate(distance, [80, 100], [0.8, 0.4]) : 1, 
        { duration: 300 }
      );
    }
  }, [isInRange, distance]);

  // Create animated styles for rotation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 800 },
        { scale: scaleAnim.value },
        { rotateY: `${rotateY.value}deg` },
        { rotateX: `${rotateX.value}deg` },
      ],
      opacity: opacityAnim.value,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        animatedStyle,
        { zIndex: isInRange ? 10 : Math.max(1, 10 - Math.floor(distance / 10)) }
      ]}
    >
      <View 
        style={[
          styles.object, 
          { 
            width: dynamicSize, 
            height: dynamicSize
          }
        ]}
        onTouchEnd={onPress}
      >
        <View style={[
          styles.objectInner,
          getObjectStyle(objectType, objectColor, size),
          isInRange && styles.objectInnerInRange
        ]} />
      </View>
      
      {isInRange && (
        <View style={[styles.glowEffect, { width: dynamicSize * 1.5, height: dynamicSize * 1.5 }]}>
          <View style={[styles.glow, { backgroundColor: objectColor }]} />
        </View>
      )}
      
      {/* Distance indicator for debugging */}
      {__DEV__ && (
        <Text style={styles.distanceText}>{Math.round(distance)}m</Text>
      )}
    </Animated.View>
  );
}

// Map agent types to 3D object types
function getObjectTypeFromAgentType(agentType?: string): string {
  const objectMapping: Record<string, string> = {
    'ai_agent': 'cube',
    'study_buddy': 'sphere', 
    'tutor': 'pyramid',
    'landmark': 'cylinder',
    'building': 'cube',
    'Intelligent Assistant': 'octahedron',
    'Content Creator': 'torus',
    'Local Services': 'cube',
    'Tutor/Teacher': 'pyramid',
    '3D World Modelling': 'sphere',
    'Game Agent': 'cube',
    'test-object': 'cube',
    'info-sphere': 'sphere',
    'test-cube': 'cube',
    'test-sphere': 'sphere'
  };
  
  return objectMapping[agentType || ''] || 'cube';
}

// Get color based on agent type
function getAgentColor(agentType?: string): string {
  const colors: Record<string, string> = {
    'ai_agent': '#3B82F6',        // Blue
    'study_buddy': '#10B981',     // Green
    'tutor': '#8B5CF6',           // Purple
    'landmark': '#F59E0B',        // Amber
    'building': '#6B7280',        // Gray
    'Intelligent Assistant': '#EC4899', // Pink
    'Content Creator': '#EF4444', // Red
    'Local Services': '#14B8A6',  // Teal
    'Tutor/Teacher': '#7C3AED',   // Violet
    '3D World Modelling': '#F97316', // Orange
    'Game Agent': '#06B6D4',      // Cyan
    'test-object': '#3B82F6',     // Blue
    'info-sphere': '#10B981',     // Green
    'test-cube': '#EC4899',       // Pink
    'test-sphere': '#F59E0B'      // Amber
  };
  
  return colors[agentType || ''] || '#00d4ff';
}

// Get style based on object type
function getObjectStyle(objectType: string, color: string, size: number): object {
  const baseStyle = {
    backgroundColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  };
  
  switch (objectType) {
    case 'cube':
      return {
        ...baseStyle,
        borderRadius: size * 0.1,
      };
    case 'sphere':
      return {
        ...baseStyle,
        borderRadius: size / 2, // Full circle
      };
    case 'pyramid':
      return {
        ...baseStyle,
        borderRadius: size * 0.1,
        transform: [{ rotateZ: '45deg' }, { scaleY: 0.7 }],
      };
    case 'cylinder':
      return {
        ...baseStyle,
        borderRadius: size * 0.2,
        height: size * 1.2,
      };
    case 'octahedron':
      return {
        ...baseStyle,
        borderRadius: size * 0.15,
        transform: [{ rotate: '45deg' }],
      };
    case 'torus':
      return {
        ...baseStyle,
        borderRadius: size / 2,
        borderWidth: size * 0.15,
        borderColor: color,
        backgroundColor: 'transparent',
      };
    default:
      return {
        ...baseStyle,
        borderRadius: size * 0.1,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'visible',
  },
  object: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    backfaceVisibility: 'visible',
  },
  objectInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'visible'
  },
  objectInnerInRange: {
    borderWidth: 2,
    borderColor: '#ffffff80'
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
    zIndex: -1
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    opacity: 0.3,
    transform: [{ scale: 0.8 }]
  },
  distanceText: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});