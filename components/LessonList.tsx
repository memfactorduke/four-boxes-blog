import Link from "next/link";
import { LessonWithProgress } from "@/lib/types";

interface LessonListProps {
  lessons: LessonWithProgress[];
  courseSlug: string;
  currentLessonSlug?: string;
}

export default function LessonList({
  lessons,
  courseSlug,
  currentLessonSlug,
}: LessonListProps) {
  return (
    <div className="flex flex-col">
      {lessons.map((lesson, index) => {
        const isCurrent = lesson.slug === currentLessonSlug;

        return (
          <Link
            key={lesson.id}
            href={`/courses/${courseSlug}/${lesson.slug}`}
            className={`flex items-center gap-3 border-b border-[#333845] px-4 py-3 transition-all duration-300 ${
              isCurrent
                ? "bg-[#1e3a5f]/25 border-l-2 border-l-[#c9a84c]"
                : "hover:bg-[#1c1f27]/60"
            }`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              {lesson.completed ? (
                <svg className="h-5 w-5 text-[#5a9a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <span className="text-xs font-medium text-[#e8e6e3]/45">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm ${
                  isCurrent ? "font-medium text-[#c9a84c]" : "text-[#e8e6e3]/80"
                }`}
              >
                {lesson.title}
              </p>
              {lesson.duration_minutes && (
                <p className="text-xs text-[#e8e6e3]/45">
                  {lesson.duration_minutes} min
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
