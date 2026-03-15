"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lesson, LessonWithProgress } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import { updateLastWatched } from "@/lib/database";
import MarkCompleteButton from "./MarkCompleteButton";
import LessonList from "./LessonList";

interface LessonViewerProps {
  lesson: Lesson;
  lessons: LessonWithProgress[];
  courseSlug: string;
  courseTitle: string;
  userId: string;
  isCompleted: boolean;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export default function LessonViewer({
  lesson,
  lessons,
  courseSlug,
  courseTitle,
  userId,
  isCompleted,
  prevLesson,
  nextLesson,
}: LessonViewerProps) {
  const supabase = createClient();

  useEffect(() => {
    updateLastWatched(supabase, userId, lesson.id).catch(console.error);
  }, [lesson.id, userId]);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Video */}
        <div className="relative aspect-video w-full bg-black shadow-2xl shadow-black/40">
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Lesson info */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#e8e6e3]/55">
                <Link href={`/courses/${courseSlug}`} className="hover:text-[#c9a84c] transition-all duration-300">
                  {courseTitle}
                </Link>
              </p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-white">{lesson.title}</h1>
              {lesson.description && (
                <p className="mt-2 text-[#e8e6e3]/75">{lesson.description}</p>
              )}
              {lesson.duration_minutes && (
                <p className="mt-1 text-sm text-[#e8e6e3]/45">
                  {lesson.duration_minutes} minutes
                </p>
              )}
            </div>
            <MarkCompleteButton
              lessonId={lesson.id}
              userId={userId}
              initialCompleted={isCompleted}
            />
          </div>

          {/* Supplementary content */}
          {lesson.content && (
            <div className="mt-8 prose prose-invert prose-zinc max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdown(lesson.content),
                }}
              />
            </div>
          )}

          {/* Previous/Next navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-[#333845] pt-6">
            {prevLesson ? (
              <Link
                href={`/courses/${courseSlug}/${prevLesson.slug}`}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#e8e6e3]/65 hover:text-white hover:bg-[#1c1f27] transition-all duration-300"
              >
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="max-w-[200px] truncate">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/courses/${courseSlug}/${nextLesson.slug}`}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#e8e6e3]/65 hover:text-white hover:bg-[#1c1f27] transition-all duration-300"
              >
                <span className="max-w-[200px] truncate">{nextLesson.title}</span>
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Lesson list */}
      <aside className="w-full border-t border-[#333845] lg:w-80 lg:border-l lg:border-t-0">
        <div className="sticky top-0 p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#e8e6e3]/75">Course Lessons</h2>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-[#333845] shadow-md shadow-black/25">
            <LessonList
              lessons={lessons}
              courseSlug={courseSlug}
              currentLessonSlug={lesson.slug}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

// Simple markdown to HTML converter for supplementary content
function simpleMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}
