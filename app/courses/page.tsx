import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCoursesWithProgress } from "@/lib/database";
import CourseCard from "@/components/CourseCard";

export const metadata = { title: "The Menu — Second Amendment Online" };

export default async function CoursesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const courses = await getCoursesWithProgress(supabase, user!.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white animate-fade-in-up">The Menu</h1>
      <p className="mt-2 text-[#e8e6e3]/65 animate-fade-in-up animate-delay-100">
        Browse all available courses and track your progress.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="mt-12 text-center text-[#e8e6e3]/55 animate-fade-in-up">
          No courses available yet. Check back soon!
        </div>
      )}
    </div>
  );
}
