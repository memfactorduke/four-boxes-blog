import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getProfile } from "@/lib/database";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profile — The Four Boxes Diner" };

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile(supabase, user!.id);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Profile</h1>
      <p className="mt-2 text-[#e8e6e3]/50">Manage your account information.</p>

      <div className="mt-8 rounded-xl border border-[#2a2d35] bg-[#1a1d23] p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#e8e6e3]/40">
            Email
          </label>
          <p className="mt-1 text-white">{user!.email}</p>
        </div>

        <ProfileForm
          userId={user!.id}
          initialDisplayName={profile?.display_name || ""}
        />
      </div>
    </div>
  );
}
