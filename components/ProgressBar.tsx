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

  return (
    <div className="w-full">
      <div className={`w-full rounded-full bg-[#2a2d35] ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500`}
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage === 100 ? "#4a7c59" : "#c9a84c",
          }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-[#e8e6e3]/40">
          {completed} of {total} lessons complete ({percentage}%)
        </p>
      )}
    </div>
  );
}
