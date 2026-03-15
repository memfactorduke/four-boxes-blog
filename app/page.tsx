import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="parchment-bg flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <div className="grid grid-cols-4 gap-1.5 mb-8 animate-fade-in-up">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/45 border border-[#2a4a7f]/45 shadow-md shadow-[#1e3a5f]/20">
              <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-[10px] text-[#e8e6e3]/45">Soap</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/45 border border-[#2a4a7f]/45 shadow-md shadow-[#1e3a5f]/20">
              <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <span className="text-[10px] text-[#e8e6e3]/45">Ballot</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/45 border border-[#2a4a7f]/45 shadow-md shadow-[#1e3a5f]/20">
              <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <span className="text-[10px] text-[#e8e6e3]/45">Jury</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/45 border border-[#2a4a7f]/45 shadow-md shadow-[#1e3a5f]/20">
              <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-[10px] text-[#e8e6e3]/45">Cartridge</span>
          </div>
        </div>

        <h1 className="font-heading max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up animate-delay-100">
          Know Your Rights.{" "}
          <span className="text-[#c9a84c]">Understand the Second Amendment.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#e8e6e3]/75 animate-fade-in-up animate-delay-200">
          Free, self-paced courses covering the history, legal foundations, safety
          principles, and modern application of the Second Amendment. Scholarly
          analysis from Second Amendment Online by Mark Smith.
        </p>
        <div className="mt-10 flex items-center gap-4 animate-fade-in-up animate-delay-300">
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-6 py-3 text-sm font-semibold text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/30 transition-all duration-300 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            Take a Seat &mdash; It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[#333845] px-6 py-3 text-sm font-medium text-[#e8e6e3]/75 transition-all duration-300 hover:bg-[#1c1f27] hover:text-white hover:border-[#c9a84c]/30"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#333845] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-center text-2xl font-bold text-white sm:text-3xl animate-fade-in-up">
            What&apos;s on the Menu
          </h2>
          <p className="mt-3 text-center text-[#e8e6e3]/55 animate-fade-in-up animate-delay-100">
            Deep, scholarly courses — not hot takes
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-[#333845] bg-[#1c1f27] p-6 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-[#c9a84c]/30 animate-fade-in-up animate-delay-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/35 border border-[#2a4a7f]/35">
                <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-heading mt-4 text-lg font-semibold text-white">
                Constitutional Foundations
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#e8e6e3]/65">
                Understand the historical context, original intent, and
                constitutional framework behind the right to keep and bear arms.
              </p>
            </div>

            <div className="rounded-xl border border-[#333845] bg-[#1c1f27] p-6 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-[#c9a84c]/30 animate-fade-in-up animate-delay-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/35 border border-[#2a4a7f]/35">
                <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-heading mt-4 text-lg font-semibold text-white">
                Safety &amp; Responsibility
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#e8e6e3]/65">
                Learn the universal rules of firearm safety, proper storage,
                and what it means to be a responsible gun owner.
              </p>
            </div>

            <div className="rounded-xl border border-[#333845] bg-[#1c1f27] p-6 shadow-md shadow-black/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-[#c9a84c]/30 animate-fade-in-up animate-delay-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/35 border border-[#2a4a7f]/35">
                <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
              </div>
              <h3 className="font-heading mt-4 text-lg font-semibold text-white">
                Laws &amp; Regulations
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#e8e6e3]/65">
                Navigate federal and state gun laws, understand your rights
                and responsibilities, and stay informed about current regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#333845] px-4 py-20 text-center animate-fade-in-up">
        <h2 className="font-heading text-2xl font-bold text-white">
          Pull Up a Chair
        </h2>
        <p className="mt-3 text-[#e8e6e3]/65">
          All courses are completely free. Create an account and start watching.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-8 py-3 text-sm font-semibold text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/30 transition-all duration-300 hover:from-[#2a4a7f] hover:to-[#3460a0] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#333845] px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-[#e8e6e3]/45">
            &copy; {new Date().getFullYear()} Second Amendment Online by Mark Smith. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.youtube.com/@fourboxesdiner" target="_blank" rel="noopener noreferrer" className="text-[#e8e6e3]/45 hover:text-[#c9a84c] transition-all duration-300">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://twitter.com/fourboxesdiner" target="_blank" rel="noopener noreferrer" className="text-[#e8e6e3]/45 hover:text-[#c9a84c] transition-all duration-300">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://thefourboxesdiner.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#e8e6e3]/45 hover:text-[#c9a84c] transition-all duration-300">
              thefourboxesdiner.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
