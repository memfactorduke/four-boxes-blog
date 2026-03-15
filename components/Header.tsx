"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-[#333845] backdrop-blur-md bg-[#0d0f14]/95 shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            {/* Four boxes icon */}
            <div className="grid grid-cols-2 gap-0.5">
              <div className="h-3 w-3 rounded-sm bg-[#c9a84c]" title="Soap Box" />
              <div className="h-3 w-3 rounded-sm bg-[#c9a84c]/80" title="Ballot Box" />
              <div className="h-3 w-3 rounded-sm bg-[#c9a84c]/60" title="Jury Box" />
              <div className="h-3 w-3 rounded-sm bg-[#c9a84c]/40" title="Cartridge Box" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold leading-tight tracking-wide text-white sm:text-xl">
                SECOND AMENDMENT ONLINE
              </span>
              <span className="hidden text-[10px] leading-tight tracking-wider text-[#c9a84c]/80 sm:block">
                by Mark Smith &mdash; Four Boxes Diner
              </span>
            </div>
          </Link>

          {user && (
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/courses" className="text-sm text-[#e8e6e3]/75 hover:text-[#c9a84c] transition-all duration-300">
                The Menu
              </Link>
              <Link href="/dashboard" className="text-sm text-[#e8e6e3]/75 hover:text-[#c9a84c] transition-all duration-300">
                Dashboard
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Social links */}
          <div className="hidden items-center gap-2 lg:flex">
            <a
              href="https://www.youtube.com/@fourboxesdiner"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300"
              title="YouTube"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/fourboxesdiner"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300"
              title="X / Twitter"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://thefourboxesdiner.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300"
              title="Website"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </a>
            <div className="mx-1 h-4 w-px bg-[#333845]" />
          </div>

          {user ? (
            <>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-[#e8e6e3]/75 hover:text-white transition-all duration-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>

              {/* Profile menu */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#e8e6e3]/75 hover:bg-[#1c1f27] hover:text-white transition-all duration-300"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8f] text-xs font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-[#333845] bg-[#1c1f27] py-1 shadow-2xl shadow-black/40">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#e8e6e3]/75 hover:bg-[#13151a] hover:text-white transition-all duration-300"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-[#e8e6e3]/75 hover:bg-[#13151a] hover:text-white transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-[#e8e6e3]/75 hover:text-white transition-all duration-300"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-4 py-1.5 text-sm font-medium text-[#c9a84c] shadow-md shadow-[#1e3a5f]/30 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="border-t border-[#333845] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/courses" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-[#e8e6e3]/75 hover:bg-[#1c1f27] hover:text-white transition-all duration-300">
              The Menu
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-[#e8e6e3]/75 hover:bg-[#1c1f27] hover:text-white transition-all duration-300">
              Dashboard
            </Link>
            <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-[#e8e6e3]/75 hover:bg-[#1c1f27] hover:text-white transition-all duration-300">
              Profile
            </Link>
            <div className="flex items-center gap-3 px-3 py-2">
              <a href="https://www.youtube.com/@fourboxesdiner" target="_blank" rel="noopener noreferrer" className="text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://twitter.com/fourboxesdiner" target="_blank" rel="noopener noreferrer" className="text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://thefourboxesdiner.com" target="_blank" rel="noopener noreferrer" className="text-[#e8e6e3]/55 hover:text-[#c9a84c] transition-all duration-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </a>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-left text-sm text-[#e8e6e3]/75 hover:bg-[#1c1f27] hover:text-white transition-all duration-300"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
