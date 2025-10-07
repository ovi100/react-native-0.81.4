import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useSharedValue, withTiming} from 'react-native-reanimated';

/**
 * A customizable animated progress bar component using Reanimated.
 *
 * @param {Object} props - Props for the ProgressBar component.
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Size of the progress bar (affects height).
 * @param {'default' | 'brand' | 'primary' | 'secondary' | 'danger' | 'success' | 'warn'} [props.variant='default'] - Visual style of the progress bar.
 * @param {number} [props.progress=0] - Progress percentage (0–100).
 * @param {number} [props.duration=1000] - Duration of the animation in milliseconds.
 * @param {'square' | 'medium' | 'rounded'} [props.edge='rounded'] - Style of the bar's corner radius.
 *
 * @returns {JSX.Element} A styled animated progress bar.
 */
const ProgressBar = ({
  size = 'medium',
  variant = 'default',
  progress = 0,
  duration = 1000,
  edge = 'rounded',
}) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress, {duration: duration});
  }, [duration, progress, progressWidth]);

  const sizes = {
    small: {height: 7, fontSize: 14},
    medium: {height: 10, fontSize: 16},
    large: {height: 14, fontSize: 18},
  };

  const variants = {
    default: {track: '#e5e7eb', fill: '#374151'},
    brand: {track: '#e5e7eb', fill: '#c03221'},
    primary: {track: '#e5e7eb', fill: '#3b82f6'},
    secondary: {track: '#e5e7eb', fill: '#a855f7'},
    danger: {track: '#e5e7eb', fill: '#ef4444'},
    success: {track: '#e5e7eb', fill: '#22c55e'},
    warn: {track: '#e5e7eb', fill: '#ff8904'},
    // custom: custom,
  };

  const edges = {
    square: 0,
    medium: 6,
    rounded: 100,
  };

  const progressStyle = {
    width: `${progress}%`,
    height: '100%',
    backgroundColor: variants[variant].fill,
    borderRadius: edges[edge],
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variants[variant].track,
          height: sizes[size].height,
          borderRadius: edges[edge],
        },
      ]}>
      <Animated.View style={progressStyle} />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  progressText: {
    fontWeight: 'semibold',
  },
});
