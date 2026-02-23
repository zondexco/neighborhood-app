import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends ViewProps {
  maxWidth?: number;
  padded?: boolean;
  className?: string;
}

export function ResponsiveContainer({
  children,
  maxWidth = 1200,
  padded = true,
  className,
  style,
  ...props
}: ResponsiveContainerProps) {
  return (
    <View
      className={cn('w-full self-center', padded && 'px-5 tablet:px-6 laptop:px-8', className)}
      style={[{ maxWidth }, style]}
      {...props}
    >
      {children}
    </View>
  );
}