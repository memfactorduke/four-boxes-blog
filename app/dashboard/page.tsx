import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getCoursesWithProgress,
  getLessonsWithProgress,
} from "@/lib/database";
import ProgressBar from "@/components/ProgressBar";

export const metadata = { title: "Dashboard — Second Amendment Online" };

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
      <h1 className="font-heading text-3xl font-bold text-white animate-fade-in-up">Dashboard</h1>
      <p className="mt-2 text-[#e8e6e3]/65 animate-fade-in-up animate-delay-100">Your learning progress at a glance.</p>

      {/* Overall stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#333845] border-l-4 border-l-[#c9a84c] bg-[#1c1f27] p-5 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c9a84c]/15">
              <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#e8e6e3]/55">Courses Available</p>
              <p className="mt-0.5 text-2xl font-bold text-white">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#333845] border-l-4 border-l-[#5a9a6e] bg-[#1c1f27] p-5 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up animate-delay-200">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5a9a6e]/15">
              <svg className="h-5 w-5 text-[#5a9a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#e8e6e3]/55">Lessons Completed</p>
              <p className="mt-0.5 text-2xl font-bold text-white">
                {totalCompleted}{" "}
                <span className="text-base font-normal text-[#e8e6e3]/45">
                  / {totalLessons}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#333845] border-l-4 border-l-[#3460a0] bg-[#1c1f27] p-5 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up animate-delay-300">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3460a0]/15">
              <svg className="h-5 w-5 text-[#3460a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#e8e6e3]/55">Overall Progress</p>
              <p className="mt-0.5 text-lg font-bold text-white">
                {totalLessons > 0
                  ? Math.round((totalCompleted / totalLessons) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              completed={totalCompleted}
              total={totalLessons}
              showLabel={false}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Course progress */}
      <h2 className="font-heading mt-12 text-xl font-semibold text-white">Your Courses</h2>

      {courseData.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#333845] bg-[#1c1f27] p-8 text-center shadow-md shadow-black/25">
          <p className="text-[#e8e6e3]/65">You haven&apos;t started any courses yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-5 py-2 text-sm font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            Browse the Menu
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {courseData.map(({ course, nextLesson }) => (
            <div
              key={course.id}
              className="flex flex-col gap-4 rounded-xl border border-[#333845] bg-[#1c1f27] p-5 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-heading text-lg font-semibold text-white hover:text-[#c9a84c] transition-all duration-300"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5a9a6e]/20 px-3 py-1 text-sm font-medium text-[#5a9a6e]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Complete
                  </span>
                ) : nextLesson ? (
                  <Link
                    href={`/courses/${course.slug}/${nextLesson.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-4 py-2 text-sm font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg transition-all duration-300 active:scale-95"
                  >
                    Continue
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm text-[#e8e6e3]/55 hover:text-white transition-all duration-300"
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
