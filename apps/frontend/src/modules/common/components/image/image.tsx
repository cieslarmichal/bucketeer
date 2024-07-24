import { Eye } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ImageProps {
  source: string;
  alt: string;
  onClick: () => void;
  className?: string | undefined;
}

export function Image({ alt, onClick, source, className }: ImageProps): JSX.Element {
  return (
    <div className="w-full h-full relative group">
      <img
        alt={alt}
        src={source}
        className={cn('cursor-pointer w-full h-full object-cover aspect-square', className)}
      />
      <div
        onClick={onClick}
        className="flex justify-center items-center absolute cursor-pointer opacity-0 group-hover:opacity-100 w-full h-full object-fill bg-gray-500/50 inset-0"
      >
        <Eye className="absolute opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
}
