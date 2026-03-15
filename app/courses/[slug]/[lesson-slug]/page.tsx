import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getCourseBySlug,
  getLessonBySlug,
  getLessonsWithProgress,
  getUserProgressForCourse,
} from "@/lib/database";
import LessonViewer from "@/components/LessonViewer";

interface Props {
  params: Promise<{ slug: string; "lesson-slug": string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, "lesson-slug": lessonSlug } = await params;
  const supabase = await createServerSupabaseClient();
  const course = await getCourseBySlug(supabase, slug);
  if (!course) return { title: "Not Found" };
  const lesson = await getLessonBySlug(supabase, course.id, lessonSlug);
  return {
    title: lesson
      ? `${lesson.title} — ${course.title} — The Four Boxes Diner`
      : "Lesson Not Found",
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug, "lesson-slug": lessonSlug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const course = await getCourseBySlug(supabase, slug);
  if (!course) notFound();

  const lesson = await getLessonBySlug(supabase, course.id, lessonSlug);
  if (!lesson) notFound();

  const lessons = await getLessonsWithProgress(supabase, course.id, user!.id);
  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);

  const progress = await getUserProgressForCourse(
    supabase,
    user!.id,
    [lesson.id]
  );
  const isCompleted = progress.some((p) => p.lesson_id === lesson.id && p.completed);

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <LessonViewer
      lesson={lesson}
      lessons={lessons}
      courseSlug={course.slug}
      courseTitle={course.title}
      userId={user!.id}
      isCompleted={isCompleted}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
