import { Eye, EyeOff } from 'lucide-react-native';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

/**
 * @param {'small' | 'medium' | 'large'} [size='medium']
 * @param {'outline' | 'underline'} [variant='outline']
 * @param {'square' | 'rounded' | 'capsule'} [edge='rounded']
 * @param {'default' | 'standard' | 'classic'} [border='default']
 * @param {React.ReactNode|null} [icon=null]
 * @param {'left' | 'right'} [iconPosition='left']
 * @param {boolean} [isPassword=false]
 */
const Input = forwardRef(
  (
    {
      size = 'medium',
      variant = 'outline',
      edge = 'rounded',
      border = 'default',
      icon = null,
      iconPosition = 'left',
      isPassword = false,
      placeholderTextColor,
      value,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // Keep secureText always reflecting latest isPassword prop.
    const [secureText, setSecureText] = useState(isPassword);
    useEffect(() => {
      setSecureText(Boolean(isPassword));
    }, [isPassword]);

    const IconWrapper = secureText ? EyeOff : Eye;

    const borderClass = useMemo(() => {
      switch (border) {
        case 'standard':
          return 'border-gray-400';
        case 'classic':
          return 'border-black';
        default:
          return 'border-[#ccc]';
      }
    }, [border]);

    const sizeInputClass = useMemo(() => {
      switch (size) {
        case 'small':
          return 'h-12 text-xs';
        case 'large':
          return 'h-16 text-base';
        default:
          return 'h-14 text-sm';
      }
    }, [size]);

    const sizeIconClass = useMemo(() => {
      switch (size) {
        case 'small':
          return 'h-12';
        case 'large':
          return 'h-16';
        default:
          return 'h-14';
      }
    }, [size]);

    const edgeClass = useMemo(() => {
      const computedEdge = variant === 'underline' ? 'square' : edge;
      switch (computedEdge) {
        case 'square':
          return 'rounded-none';
        case 'capsule':
          return 'rounded-full';
        default:
          return 'rounded-md';
      }
    }, [edge, variant]);

    const floatIconClass = useMemo(() => {
      switch (size) {
        case 'small':
          return 'absolute top-3 right-3';
        case 'large':
          return 'absolute top-5 right-3';
        default:
          return 'absolute top-4 right-3';
      }
    }, [size]);

    const isUnderline = variant === 'underline';
    const hasIcon = Boolean(icon);

    // When we have an icon + outline, split borders to avoid double lines.
    const splitLeft = !isUnderline && hasIcon && iconPosition === 'left';
    const splitRight = !isUnderline && hasIcon && iconPosition === 'right';

    const variantBorderClass = useMemo(() => {
      if (isUnderline) return `border-b ${borderClass}`;
      return `border ${borderClass}`;
    }, [isUnderline, borderClass]);

    const inputClass = useMemo(() => {
      const splitFix =
        (splitLeft ? ' border-l-0' : '') + (splitRight ? ' border-r-0' : '');
      // flex-1 lets input fill remaining space when icon exists
      return [
        'flex-1',
        sizeInputClass,
        variantBorderClass,
        edgeClass,
        'px-3',
        'text-black dark:text-gray-300',
        splitFix,
      ].join(' ');
    }, [sizeInputClass, variantBorderClass, edgeClass, splitLeft, splitRight]);

    const iconBoxClass = useMemo(() => {
      const base = [
        sizeIconClass,
        'items-center justify-center px-2',
        isUnderline ? '' : `border ${borderClass}`,
        edgeClass,
      ];
      if (!isUnderline) {
        if (iconPosition === 'left') base.push('border-r-0 rounded-tr-none rounded-br-none -mr-2');
        if (iconPosition === 'right') base.push('border-l-0 rounded-tl-none rounded-bl-none -ml-2');
      }
      return base.join(' ');
    }, [sizeIconClass, isUnderline, borderClass, edgeClass, iconPosition]);

    const toggleSecure = useCallback(() => {
      setSecureText((prev) => !prev);
    }, []);


    return (
      <View className={`relative ${hasIcon ? 'flex-row items-center' : ''} mb-2`}>
        {hasIcon && iconPosition === 'left' && (
          <View className={iconBoxClass}>{icon}</View>
        )}

        <TextInput
          ref={ref}
          className={inputClass}
          placeholderTextColor={placeholderTextColor || '#aaa'}
          secureTextEntry={secureText}
          {...props}
        />

        {isPassword && !!value && (
          <TouchableOpacity
            className={floatIconClass}
            onPress={toggleSecure}
            // hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconWrapper size={20} color={isDarkMode ? '#aaa' : '#000'} />
          </TouchableOpacity>
        )}

        {!isPassword && hasIcon && iconPosition === 'right' && (
          <View className={iconBoxClass}>{icon}</View>
        )}
      </View>
    );
  }
);

export default Input;
