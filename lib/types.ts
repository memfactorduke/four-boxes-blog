export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  content: string | null;
  order: number;
  duration_minutes: number | null;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

export interface CourseWithProgress extends Course {
  lesson_count: number;
  completed_count: number;
}

export interface LessonWithProgress extends Lesson {
  completed: boolean;
}
