import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getProfile } from "@/lib/database";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profile — Second Amendment Online" };

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile(supabase, user!.id);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white animate-fade-in-up">Profile</h1>
      <p className="mt-2 text-[#e8e6e3]/65 animate-fade-in-up animate-delay-100">Manage your account information.</p>

      <div className="mt-8 rounded-xl border border-[#333845] bg-[#1c1f27] p-6 shadow-md shadow-black/25 animate-fade-in-up animate-delay-200">
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#e8e6e3]/55">
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
