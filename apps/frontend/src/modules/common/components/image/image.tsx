import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Eye } from 'lucide-react';

import { Dialog, DialogContent, DialogTrigger } from '../../../../../@/components/ui/dialog';

import { cn } from '@/lib/utils';

interface ImageProps {
  source: string;
  previewImageSrc: string;
  alt: string;
  hasNext: boolean;
  hasPrevious: boolean;
  onClick: () => void;
  onNext: () => void;
  onPrevious: () => void;
  className?: string | undefined;
}

export function Image({
  alt,
  hasNext,
  hasPrevious,
  onClick,
  onNext,
  onPrevious,
  source,
  className,
  previewImageSrc,
}: ImageProps): JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent className="p-0 m-0 border-none sm:max-w-4xl ">
        <div className="relative">
          <img
            alt={alt}
            src={previewImageSrc}
            className="w-full h-[80vh] object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full z-10">
            <div className="flex h-full w-full z-10">
              <div className="flex justify-start items-center w-full h-full">
                {hasPrevious && (
                  <ArrowLeftIcon
                    onClick={onPrevious}
                    className="cursor-pointer w-20 h-20 text-primary-foreground"
                  />
                )}
              </div>
              <div className="flex justify-end items-center w-full h-full">
                {hasNext && (
                  <ArrowRightIcon
                    onClick={onNext}
                    className="cursor-pointer w-20 h-20 text-primary-foreground"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
