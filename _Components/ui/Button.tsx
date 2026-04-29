'use client';
import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };
export default function Button({ children, variant = 'primary', ...rest }: Props) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
