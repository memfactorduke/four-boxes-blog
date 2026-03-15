interface ProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export default function ProgressBar({
  completed,
  total,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const heightClass = size === "sm" ? "h-1.5" : "h-2.5";
  const isComplete = percentage === 100;

  return (
    <div className="w-full">
      <div className={`w-full rounded-full bg-[#333845] ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500`}
          style={{
            width: `${percentage}%`,
            background: isComplete
              ? "linear-gradient(90deg, #4a7c59, #5a9a6e)"
              : "linear-gradient(90deg, #c9a84c, #dbb94d)",
            boxShadow: percentage > 0
              ? isComplete
                ? "0 0 8px rgba(90, 154, 110, 0.4)"
                : "0 0 8px rgba(201, 168, 76, 0.3)"
              : "none",
          }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-[#e8e6e3]/55">
          {completed} of {total} lessons complete ({percentage}%)
        </p>
      )}
    </div>
  );
}
