import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getCoursesWithProgress,
  getLessonsWithProgress,
} from "@/lib/database";
import ProgressBar from "@/components/ProgressBar";

export const metadata = { title: "Dashboard — The Four Boxes Diner" };

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const courses = await getCoursesWithProgress(supabase, user!.id);

  const courseData = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessonsWithProgress(
        supabase,
        course.id,
        user!.id
      );
      const nextLesson = lessons.find((l) => !l.completed);
      return { course, nextLesson };
    })
  );

  const totalLessons = courses.reduce((sum, c) => sum + c.lesson_count, 0);
  const totalCompleted = courses.reduce(
    (sum, c) => sum + c.completed_count,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-[#e8e6e3]/50">Your learning progress at a glance.</p>

      {/* Overall stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-5">
          <p className="text-sm text-[#e8e6e3]/40">Courses Available</p>
          <p className="mt-1 text-2xl font-bold text-white">{courses.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-5">
          <p className="text-sm text-[#e8e6e3]/40">Lessons Completed</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {totalCompleted}{" "}
            <span className="text-base font-normal text-[#e8e6e3]/30">
              / {totalLessons}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-5">
          <p className="text-sm text-[#e8e6e3]/40">Overall Progress</p>
          <div className="mt-2">
            <ProgressBar
              completed={totalCompleted}
              total={totalLessons}
              showLabel={false}
              size="md"
            />
            <p className="mt-1 text-lg font-bold text-white">
              {totalLessons > 0
                ? Math.round((totalCompleted / totalLessons) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Course progress */}
      <h2 className="font-heading mt-12 text-xl font-semibold text-white">Your Courses</h2>

      {courseData.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-8 text-center">
          <p className="text-[#e8e6e3]/50">You haven&apos;t started any courses yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-[#1e3a5f] px-5 py-2 text-sm font-medium text-[#c9a84c] hover:bg-[#2a4a7f] transition-colors"
          >
            Browse the Menu
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {courseData.map(({ course, nextLesson }) => (
            <div
              key={course.id}
              className="flex flex-col gap-4 rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-heading text-lg font-semibold text-white hover:text-[#c9a84c] transition-colors"
                >
                  {course.title}
                </Link>
                <div className="mt-2 max-w-xs">
                  <ProgressBar
                    completed={course.completed_count}
                    total={course.lesson_count}
                    size="sm"
                  />
                </div>
              </div>

              <div className="shrink-0">
                {course.completed_count === course.lesson_count &&
                course.lesson_count > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4a7c59]/20 px-3 py-1 text-sm font-medium text-[#4a7c59]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Complete
                  </span>
                ) : nextLesson ? (
                  <Link
                    href={`/courses/${course.slug}/${nextLesson.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-[#c9a84c] hover:bg-[#2a4a7f] transition-colors"
                  >
                    Continue
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm text-[#e8e6e3]/40 hover:text-white transition-colors"
                  >
                    View Course
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
