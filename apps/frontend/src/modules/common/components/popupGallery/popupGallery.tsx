import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Eye } from 'lucide-react';
import { type FC, type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

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
  previewVideoSrc?: string;
  alt: string;
  isFocused: boolean;
}

interface MiniatureVideoProps {
  previewVideoSrc: string | undefined;
  onClick: () => void;
  isFocused?: boolean;
}

const MiniatureVideo: FC<MiniatureVideoProps> = ({ previewVideoSrc, isFocused, onClick }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const eyeRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !eyeRef.current) {
      return;
    }

    const videoRefInternal = videoRef.current;

    const onMouseOver = async (): Promise<void> => {
      setHovering(true);
      return videoRefInternal.play();
    };
    const onMouseLeave = async (): Promise<void> => {
      setHovering(false);
      return videoRefInternal.pause();
    };

    if (isFocused) {
      videoRefInternal.play();
    } else if (!isFocused && !hovering) {
      videoRefInternal.pause();
    }

    const eyeRefInternal = eyeRef.current;

    eyeRefInternal.addEventListener("mouseover", onMouseOver);
    eyeRefInternal.addEventListener("mouseleave", onMouseLeave);

    return (): void => {
      if (!videoRefInternal || !eyeRefInternal) {
        return;
      }

      eyeRefInternal.removeEventListener("mouseover", onMouseOver)
      eyeRefInternal.removeEventListener("mouseleave", onMouseLeave)
    };
  }, [isFocused]);

  return (
    <div className="flex items-center justify-center">
      <video
        ref={videoRef}
        loop
        muted
        className="w-40 h-40 object-contain"
      >
        <source
          src={previewVideoSrc}
          type="video/webm"
        />
      </video>
      <div
        onClick={onClick}
        ref={eyeRef}
        className="flex justify-center items-center absolute cursor-pointer opacity-0 group-hover:opacity-100 w-full h-full object-fill bg-gray-500/10 inset-0"
      >
        <Eye className="absolute opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
};

export const Media = ({
  alt,
  hasNext,
  hasPrevious,
  onClick,
  onNext,
  onPrevious,
  onClose,
  isFocused,
  source,
  className,
  previewImageSrc,
  previewVideoSrc,
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
        <div className="relative group">
          {isVideoFile && (
            <MiniatureVideo
              previewVideoSrc={previewVideoSrc}
              onClick={onClick}
              isFocused={isFocused}
            />
          )}
          {!isVideoFile && (
            <div className="w-40 h-40">
              <img
                alt={alt}
                src={source}
                className={cn('cursor-pointer w-full h-full object-cover aspect-square', className)}
              />
              <div
                onClick={onClick}
                className="flex justify-center items-center absolute cursor-pointer opacity-0 group-hover:opacity-100 w-40 h-40 object-fill bg-gray-500/50 inset-0"
              >
                <Eye className="absolute opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        excludeCloseIcon={true}
        className="p-0 m-0 border-none sm:max-w-4xl"
      >
        <DialogTitle className="hidden">Media container</DialogTitle>
        <div className="relative w-full flex items-center justify-center">
          {isVideoFile && (
            <video
              className="max-h-[80vh]"
              controls
              muted
              autoPlay
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
              className="w-full object-contain"
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
  preview?: {
    url?: string;
    contentType?: string;
  };
}

interface PopupGalleryProps {
  previewResourceIndex: number;
  resources: PreviewableResource[];
  isFocused: boolean;
}

export function PopupGallery({
  resources,
  isFocused,
  previewResourceIndex: originalPreviewResourceIndex,
}: PopupGalleryProps): ReactNode {
  const [previewResourceIndex, setPreviewResourceIndex] = useState(originalPreviewResourceIndex);

  const deferredIndex = useDeferredValue(previewResourceIndex);

  return (
    <Media
      source={resources[previewResourceIndex].url}
      alt={resources[previewResourceIndex].name}
      onClick={() => {}}
      onPrevious={() => setPreviewResourceIndex(previewResourceIndex - 1)}
      onNext={() => setPreviewResourceIndex(previewResourceIndex + 1)}
      previewImageSrc={resources[deferredIndex].url ?? ''}
      previewVideoSrc={resources[deferredIndex].preview?.url}
      hasPrevious={previewResourceIndex - 1 >= 0}
      hasNext={resources.length > previewResourceIndex + 1}
      onClose={() => setPreviewResourceIndex(originalPreviewResourceIndex)}
      isFocused={isFocused}
    />
  );
}
