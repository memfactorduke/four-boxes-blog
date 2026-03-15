import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCoursesWithProgress } from "@/lib/database";
import CourseCard from "@/components/CourseCard";

export const metadata = { title: "The Menu — The Four Boxes Diner" };

export default async function CoursesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const courses = await getCoursesWithProgress(supabase, user!.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">The Menu</h1>
      <p className="mt-2 text-[#e8e6e3]/50">
        Browse all available courses and track your progress.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="mt-12 text-center text-[#e8e6e3]/40">
          No courses available yet. Check back soon!
        </div>
      )}
    </div>
  );
}
