import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: any;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  
  const getButtonStyles = () => {
    const baseStyles = [styles.button];
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonLarge);
        break;
      default:
        baseStyles.push(styles.buttonMedium);
    }
    
    // Add variant styles
    switch (variant) {
      case 'secondary':
        baseStyles.push({ backgroundColor: colors.secondary });
        break;
      case 'outline':
        baseStyles.push({ 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary
        });
        break;
      case 'text':
        baseStyles.push({ 
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0
        });
        break;
      default:
        // Primary variant uses gradient or solid color
        if (variant !== 'primary') {
          baseStyles.push({ backgroundColor: colors.primary });
        }
    }
    
    // Add disabled styles
    if (disabled) {
      baseStyles.push({ 
        opacity: 0.6,
        elevation: 0,
        shadowOpacity: 0
      });
    }
    
    return baseStyles;
  };
  
  const getTextStyles = () => {
    const baseStyles = [styles.buttonText];
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonTextSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonTextLarge);
        break;
      default:
        baseStyles.push(styles.buttonTextMedium);
    }
    
    // Add variant styles
    switch (variant) {
      case 'outline':
        baseStyles.push({ color: colors.primary });
        break;
      case 'text':
        baseStyles.push({ color: colors.primary });
        break;
      default:
        baseStyles.push({ color: 'white' });
    }
    
    return baseStyles;
  };
  
  const renderContent = () => {
    const textStyles = getTextStyles();
    
    if (isLoading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? colors.primary : 'white'} 
        />
      );
    }
    
    const content = (
      <>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text style={[...textStyles, textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </>
    );
    
    return content;
  };
  
  // For primary variant, use LinearGradient
  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[styles.buttonWrapper, style]}
        {...props}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={getButtonStyles()}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  // For other variants, use regular TouchableOpacity
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[...getButtonStyles(), style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextMedium: {
    fontSize: 16,
  },
  buttonTextLarge: {
    fontSize: 18,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});