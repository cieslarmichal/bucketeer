import { PlusCircleIcon } from '@heroicons/react/20/solid';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fileName: string;
  containerClassName?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, containerClassName, fileName, type, ...props }, ref) => {
    return (
      <div
        className={cn(
          `flex
         flex-row
         has-[input:focus-visible]:ring-2
         has-[input:focus-visible]:ring-ring
         has-[input:focus-visible]:ring-offset-4
         bg-[#D1D5DB]/20
         rounded-md
         border
         border-input
         ring-offset-background
         h-24
         w-60 sm:w-96
         relative`,
          containerClassName,
        )}
      >
        <input
          type={type}
          className={cn(
            'w-60 sm:w-96 flex h-24 px-3 py-2 rounded-md text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 bg-none bg-[unset] focus:border-none outline-none cursor-pointer',
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className={cn('w-60 sm:w-96 absolute h-24 px-2 items-center flex justify-between pointer-events-none')}>
          <p className="text-sm truncate">{fileName}</p>
          <div className="px-2">
            <PlusCircleIcon className={cn('h-6 w-6 text-primary pointer-events-none')}></PlusCircleIcon>
          </div>
        </div>
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';

Input.displayName = 'Input';

export { Input, FileInput };
