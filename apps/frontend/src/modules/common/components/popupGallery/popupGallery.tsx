import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Eye } from 'lucide-react';
import { type ReactNode, useDeferredValue, useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';

import { cn } from '@/lib/utils';

const VIDEO_FILE_EXTENSIONS = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.m4v',
  '.mpeg',
  '.3gp',
  '.ogv',
  '.vob',
  '.rm',
  '.divx',
  '.mxf',
  '.ts',
  '.f4v',
  '.mts',
  '.m2ts',
];

interface MediaProps {
  source: string;
  hasNext: boolean;
  hasPrevious: boolean;
  onClick: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  className?: string | undefined;
  previewImageSrc: string;
  alt: string;
}

export const Media = ({
  alt,
  hasNext,
  hasPrevious,
  onClick,
  onNext,
  onPrevious,
  onClose,
  source,
  className,
  previewImageSrc,
}: MediaProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open === false) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onOpenChange = (val: boolean): void => {
    setOpen(val);
  };

  const isVideoFile = useMemo(() => {
    return VIDEO_FILE_EXTENSIONS.some((extension) => {
      return alt.endsWith(extension);
    });
  }, [alt]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <div className="w-full h-full relative group">
          {isVideoFile && (
            <video className="h-20 w-20">
              <source
                src={source}
                type="video/webm"
              />
            </video>
          )}
          {!isVideoFile && (
            <img
              alt={alt}
              src={source}
              className={cn('cursor-pointer w-full h-full object-cover aspect-square', className)}
            />
          )}
          <div
            onClick={onClick}
            className="flex justify-center items-center absolute cursor-pointer opacity-0 group-hover:opacity-100 w-full h-full object-fill bg-gray-500/50 inset-0"
          >
            <Eye className="absolute opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        excludeCloseIcon={true}
        className="p-0 m-0 border-none sm:max-w-4xl "
      >
        <DialogTitle className="hidden">Image container</DialogTitle>
        <div className="relative">
          {isVideoFile && (
            <video
              className="w-full h-full"
              controls
            >
              <source
                src={source}
                type="video/webm"
              />
            </video>
          )}
          {!isVideoFile && (
            <img
              alt={alt}
              src={previewImageSrc}
              className="w-full h-[80vh] object-contain"
            />
          )}
          <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            <div className="flex h-full w-full z-10">
              <div className="flex justify-start items-center w-full h-full">
                {hasPrevious && (
                  <ArrowLeftIcon
                    onClick={onPrevious}
                    className="opacity-0 hover:opacity-100 cursor-pointer w-20 h-20 text-primary pointer-events-auto"
                  />
                )}
              </div>
              <div className="flex justify-end items-center w-full h-full">
                {hasNext && (
                  <ArrowRightIcon
                    onClick={onNext}
                    className="opacity-0 hover:opacity-100 cursor-pointer w-20 h-20 text-primary pointer-events-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export interface PreviewableResource {
  url: string;
  name: string;
}

interface PopupGalleryProps {
  previewResourceIndex: number;
  resources: PreviewableResource[];
}

export function PopupGallery({
  resources,
  previewResourceIndex: originalPreviewResourceIndex,
}: PopupGalleryProps): ReactNode {
  const [previewResourceIndex, setPreviewResourceIndex] = useState(originalPreviewResourceIndex);

  const deferredIndex = useDeferredValue(previewResourceIndex);

  return (
    <div className="h-20 w-20">
      <Media
        source={resources[previewResourceIndex].url}
        alt={resources[previewResourceIndex].name}
        onClick={() => {}}
        onPrevious={() => setPreviewResourceIndex(previewResourceIndex - 1)}
        onNext={() => setPreviewResourceIndex(previewResourceIndex + 1)}
        previewImageSrc={resources[deferredIndex].url ?? ''}
        hasPrevious={previewResourceIndex - 1 >= 0}
        hasNext={resources.length > previewResourceIndex + 1}
        onClose={() => setPreviewResourceIndex(originalPreviewResourceIndex)}
      />
    </div>
  );
}
