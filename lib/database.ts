import { SupabaseClient } from "@supabase/supabase-js";
import {
  Course,
  CourseWithProgress,
  Lesson,
  LessonWithProgress,
  Profile,
  UserProgress,
} from "./types";

export async function getCourses(
  supabase: SupabaseClient
): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCourseBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getLessonsForCourse(
  supabase: SupabaseClient,
  courseId: string
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLessonBySlug(
  supabase: SupabaseClient,
  courseId: string,
  lessonSlug: string
): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("slug", lessonSlug)
    .single();

  if (error) return null;
  return data;
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: { display_name: string }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getUserProgressForCourse(
  supabase: SupabaseClient,
  userId: string,
  lessonIds: string[]
): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (error) throw error;
  return data;
}

export async function markLessonComplete(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string
): Promise<void> {
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) throw error;
}

export async function markLessonIncomplete(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_progress")
    .update({
      completed: false,
      completed_at: null,
    })
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);

  if (error) throw error;
}

export async function updateLastWatched(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string
): Promise<void> {
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) throw error;
}

export async function getCoursesWithProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<CourseWithProgress[]> {
  const courses = await getCourses(supabase);

  const coursesWithProgress: CourseWithProgress[] = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessonsForCourse(supabase, course.id);
      const lessonIds = lessons.map((l) => l.id);

      let completedCount = 0;
      if (lessonIds.length > 0) {
        const progress = await getUserProgressForCourse(
          supabase,
          userId,
          lessonIds
        );
        completedCount = progress.filter((p) => p.completed).length;
      }

      return {
        ...course,
        lesson_count: lessons.length,
        completed_count: completedCount,
      };
    })
  );

  return coursesWithProgress;
}

export async function getLessonsWithProgress(
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<LessonWithProgress[]> {
  const lessons = await getLessonsForCourse(supabase, courseId);
  const lessonIds = lessons.map((l) => l.id);

  let progressMap: Record<string, boolean> = {};
  if (lessonIds.length > 0) {
    const progress = await getUserProgressForCourse(
      supabase,
      userId,
      lessonIds
    );
    progress.forEach((p) => {
      progressMap[p.lesson_id] = p.completed;
    });
  }

  return lessons.map((lesson) => ({
    ...lesson,
    completed: progressMap[lesson.id] || false,
  }));
}
