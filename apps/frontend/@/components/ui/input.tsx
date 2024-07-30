import { ArrowUpOnSquareIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import * as React from 'react';

import { ScrollArea } from './scroll-area';

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
  onFilesValueChange: (files: FileList) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    { className, containerClassName, fileName, type, onFilesValueChange, ...props },
    ref: React.Ref<HTMLInputElement | null>,
  ) => {
    const filesNames = fileName.split(',');

    const innerRef = React.useRef<HTMLInputElement | null>(null);

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const dragImageRef = React.useRef<HTMLDivElement | null>(null);

    React.useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      (): HTMLInputElement | null => innerRef?.current,
      [innerRef],
    );

    // todo: revisit types
    const onClick = (): void => {
      // eslint-disable-next-line
    // @ts-ignore
      if (ref?.current) {
        // eslint-disable-next-line
    // @ts-ignore
        ref?.current.click();
      }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();

      if (dragImageRef.current) {
        dragImageRef.current.classList.remove('drag-view-invisible');

        dragImageRef.current.classList.add('drag-view-visible');
      }
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();

      if (dragImageRef.current) {
        dragImageRef.current.classList.remove('drag-view-visible');

        dragImageRef.current.classList.add('drag-view-invisible');
      }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();

      if (dragImageRef.current) {
        dragImageRef.current.classList.remove('drag-view-visible');

        dragImageRef.current.classList.add('drag-view-invisible');
      }

      if (innerRef.current) {
        innerRef.current.files = e.dataTransfer.files;

        onFilesValueChange(e.dataTransfer.files);
      }
    };

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
         h-32
         w-60 sm:w-96
         relative`,
          containerClassName,
        )}
        ref={containerRef}
      >
        <input
          type={type}
          className={cn(
            'hidden w-60 sm:w-96 h-32 px-3 py-2 rounded-md text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 bg-none bg-[unset] focus:border-none outline-none cursor-pointer',
            className,
          )}
          ref={innerRef}
          {...props}
        />
        <div
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn('cursor-pointer w-full h-full pl-2 items-center flex justify-between')}
        >
          {/* todo: add scroll area here to display lots of files */}
          <ScrollArea className={cn('w-full h-full rounded-md py-2')}>
            <div className="flex flex-col gap-2">
              {filesNames.map((name, index) => (
                <p
                  key={`${index}-${name}`}
                  className="text-sm truncate"
                >
                  {name}
                </p>
              ))}
            </div>
          </ScrollArea>
          <div className="absolute right-0 px-2">
            <PlusCircleIcon className={cn('h-6 w-6 text-primary pointer-events-none')}></PlusCircleIcon>
          </div>
        </div>
        <div
          ref={dragImageRef}
          className="drag-view-invisible absolute w-full h-full border rounded-md pointer-events-none"
        >
          <div className="flex w-full h-full gap-2 items-center justify-center">
            <ArrowUpOnSquareIcon className="h-10 w-10 text-primary"></ArrowUpOnSquareIcon>
            <p>Drop files here</p>
          </div>
        </div>
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';

Input.displayName = 'Input';

export { Input, FileInput };
