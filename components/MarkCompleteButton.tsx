"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { markLessonComplete, markLessonIncomplete } from "@/lib/database";

interface MarkCompleteButtonProps {
  lessonId: string;
  userId: string;
  initialCompleted: boolean;
}

export default function MarkCompleteButton({
  lessonId,
  userId,
  initialCompleted,
}: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (completed) {
        await markLessonIncomplete(supabase, userId, lessonId);
        setCompleted(false);
      } else {
        await markLessonComplete(supabase, userId, lessonId);
        setCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 active:scale-95 ${
        completed
          ? "bg-[#5a9a6e]/20 text-[#5a9a6e] border border-[#5a9a6e]/40 hover:bg-[#5a9a6e]/30 shadow-md shadow-[#5a9a6e]/10"
          : "bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg"
      }`}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : completed ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {completed ? "Completed" : "Mark as Complete"}
    </button>
  );
}
