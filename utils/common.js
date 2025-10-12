import { Platform } from 'react-native';
import { width } from '.';

const sizes = {
  tiny: { space: 8, fontSize: 12, iconSize: 12 },
  small: { space: 10, fontSize: 14, iconSize: 16 },
  medium: { space: 14, fontSize: 16, iconSize: 20 },
  large: { space: 18, fontSize: 18, iconSize: 24 },
};

let variants = {
  default: { bg: '#d1d5db', text: '#1f2937', iconColor: 'black' },
  brand: { bg: '#4f46e5', text: 'white', iconColor: 'white' },
  primary: { bg: '#3b82f6', text: 'white', iconColor: 'white' },
  secondary: { bg: '#a855f7', text: 'white', iconColor: 'white' },
  danger: { bg: '#ef4444', text: 'white', iconColor: 'white' },
  success: { bg: '#22c55e', text: 'white', iconColor: 'white' },
  warn: { bg: '#fb923c', text: 'white', iconColor: 'white' },
  cancel: { bg: '#e5e7eb', text: '#374151', iconColor: 'white' },
  action: { bg: '#bae6fd', text: '#1d4ed8', iconColor: 'white' },
  text: { bg: 'transparent', text: '#1d4ed8', iconColor: 'black' },
};

const colors = {
  default: '#000000',
  brand: '#4f46e5',
  primary: '#3b82f6',
  secondary: '#a855f7',
  danger: '#ef4444',
  success: '#22c55e',
  warn: '#fb923c',
  cancel: '#e5e7eb',
  action: '#bae6fd',
};

const lighten = (hex, percent = 30) => {
  // Remove '#' and parse RGB values
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Lighten each channel by the given percentage
  const light = value => Math.min(255, value + (255 - value) * (percent / 100));

  // Convert back to hex
  return `#${[r, g, b]
    .map(light)
    .map(v => Math.round(v).toString(16).padStart(2, '0'))
    .join('')}`;
};

const getElevation = () => {
  const result = {};
  for (let i = 0; i <= 10; i++) {
    if (i === 0) {
      result[i] = {};
    } else {
      result[i] = {
        elevation: i,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: i },
        shadowOpacity: 0.1 * i,
        shadowRadius: i * 2,
      };
    }
  }
  return result;
};

const elevations = getElevation();

const OPTIONS = {
  headerShown: true,
  headerShadowVisible: false,
  headerBackVisible: false,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontSize: width >= 360 ? 18 : 16,
  },
};

const edges = {
  square: 0,
  rounded: 6,
  capsule: 100,
  circular: 9999,
};

const quantityRegex = /^(?!0[01])\d+(\.\d+)?$/;
const menuElevation = {
  backgroundColor: 'white',
  borderRadius: 12,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
};

export {
  colors,
  edges,
  elevations,
  lighten,
  menuElevation,
  OPTIONS,
  quantityRegex,
  sizes,
  variants,
};
