"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { updateProfile } from "@/lib/database";

interface ProfileFormProps {
  userId: string;
  initialDisplayName: string;
}

export default function ProfileForm({
  userId,
  initialDisplayName,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      await updateProfile(supabase, userId, { display_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="displayName"
        className="block text-sm font-medium text-[#e8e6e3]/55"
      >
        Display Name
      </label>
      <input
        id="displayName"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[#333845] bg-[#13151a] px-3 py-2.5 text-sm text-white placeholder-[#e8e6e3]/40 focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-5 py-2 text-sm font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 transition-all duration-300 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg disabled:opacity-50 active:scale-95"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-[#5a9a6e]">Saved!</span>
        )}
      </div>
    </form>
  );
}
