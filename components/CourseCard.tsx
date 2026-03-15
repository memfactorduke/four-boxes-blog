import Link from "next/link";
import { CourseWithProgress } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface CourseCardProps {
  course: CourseWithProgress;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#333845] bg-[#1c1f27] shadow-md shadow-black/25 transition-all duration-300 hover:border-[#c9a84c]/40 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full bg-[#13151a] overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1e3a5f]/35 to-[#13151a]">
            <svg className="h-12 w-12 text-[#2a4a7f]/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
        )}
        {course.completed_count === course.lesson_count && course.lesson_count > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-[#5a9a6e] px-2 py-0.5 text-xs font-medium text-white shadow-md">
            Completed
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-all duration-300">
          {course.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#e8e6e3]/65">
          {course.description.length > 150
            ? course.description.slice(0, 150) + "..."
            : course.description}
        </p>
        <div className="mt-4">
          <ProgressBar
            completed={course.completed_count}
            total={course.lesson_count}
          />
        </div>
      </div>
    </Link>
  );
}
