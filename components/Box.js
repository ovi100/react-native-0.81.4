import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, elevations} from '../utils/common';

/**
 * A customizable Box component with support for style, Shadow states.
 *
 * @param {Object} props - Box component props.
 * @param {Object} [props.style=null] - Style of the Box.
 * @param {Number} [props.elevation=0] - Box shadow of the Box.
 * @param {React.ReactNode|null} [props.children=null] - Optional icon to render inside the button.
 *
 * @returns {JSX.Element} A styled button component.
 */
const Box = ({style = null, elevation = 0, children}) => {
  const boxStyle = [
    styles.box,
    style,
    elevation !== undefined && elevations[elevation],
  ];

  return <View style={boxStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    
  },
});

export default Box;
