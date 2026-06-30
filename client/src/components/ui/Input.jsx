import { forwardRef } from 'react';

const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[
        'w-full box-border px-4 py-3 rounded-lg',
        'bg-surface-input text-content border border-edge',
        'transition-colors',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});

export default Input;
