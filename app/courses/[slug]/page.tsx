import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCourseBySlug, getLessonsWithProgress } from "@/lib/database";
import ProgressBar from "@/components/ProgressBar";
import LessonList from "@/components/LessonList";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const course = await getCourseBySlug(supabase, slug);
  return { title: course ? `${course.title} — Second Amendment Online` : "Course Not Found" };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const course = await getCourseBySlug(supabase, slug);
  if (!course) notFound();

  const lessons = await getLessonsWithProgress(supabase, course.id, user!.id);
  const completedCount = lessons.filter((l) => l.completed).length;
  const firstIncomplete = lessons.find((l) => !l.completed);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-[#e8e6e3]/55 hover:text-[#e8e6e3]/80 transition-all duration-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Menu
      </Link>

      <div className="mt-6 animate-fade-in-up">
        <h1 className="font-heading text-3xl font-bold text-white">{course.title}</h1>
        <p className="mt-3 text-[#e8e6e3]/65 leading-relaxed">{course.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="w-full max-w-xs">
            <ProgressBar completed={completedCount} total={lessons.length} />
          </div>
          {firstIncomplete && (
            <Link
              href={`/courses/${course.slug}/${firstIncomplete.slug}`}
              className="rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-5 py-2 text-sm font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              {completedCount > 0 ? "Continue Learning" : "Start Course"}
            </Link>
          )}
          {!firstIncomplete && lessons.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5a9a6e]/20 px-3 py-1 text-sm font-medium text-[#5a9a6e]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Course Completed
            </span>
          )}
        </div>
      </div>

      <div className="mt-10 animate-fade-in-up animate-delay-200">
        <h2 className="font-heading mb-4 text-lg font-semibold text-[#e8e6e3]/85">
          Lessons ({lessons.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-[#333845] shadow-md shadow-black/25">
          <LessonList lessons={lessons} courseSlug={course.slug} />
        </div>
      </div>
    </div>
  );
}
