import { cn } from "@/utils/utils";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  fullHeight?: boolean;
};

const LoadingIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={32}
    height={32}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin text-primary", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const LoadingSpinner = ({ label, className, fullHeight = true }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center", fullHeight ? "min-h-[280px]" : "", className)}>
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <LoadingIcon />
        <p>{label ?? "Loading data..."}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
