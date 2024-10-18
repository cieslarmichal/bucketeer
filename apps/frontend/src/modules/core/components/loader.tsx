import { SVGProps } from "react";
import { cn } from "../../../../@/lib/utils";

export interface ISVGProps extends SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
  }
  
export const Loader = ({ size = 60, className, ...props }: ISVGProps) => {
    return <div className="flex w-full h-full items-center justify-center">
        <svg
        width={size}
        height={size}
        viewBox={`0 0 24 24`}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('animate-spin stroke-primary', className)}
        {...props}
        >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    </div>
}