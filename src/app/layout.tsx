import type { Metadata } from 'next';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import './globals.css';

export const metadata: Metadata = {
  title: 'Events Dashboard',
  description: 'Professional event analytics and management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        {/* macOS-style Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-white/10 system-blur">
          <div className="container mx-auto px-6">
            <div className="flex h-12 items-center justify-between">
              {/* Logo and App Name */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    Events Dashboard
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Apple-style pills */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                  <NavLink href="/" icon="dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink href="/events" icon="calendar">
                    Events
                  </NavLink>
                  <NavLink href="/upload" icon="upload">
                    Upload
                  </NavLink>
                  <NavLink href="/uploads" icon="database">
                    Uploads
                  </NavLink>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2">
                {/* Search button */}
                <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-white/10 rounded-lg">
                  <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Button>

                {/* Mobile Navigation */}
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] bg-system-gray-800 border-white/10">
                    <div className="mt-8">
                      <div className="px-3 mb-2">
                        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Navigation</h2>
                      </div>
                      <div className="space-y-1">
                        <MobileNavLink href="/" icon="dashboard">
                          Dashboard
                        </MobileNavLink>
                        <MobileNavLink href="/events" icon="calendar">
                          Events
                        </MobileNavLink>
                        <MobileNavLink href="/upload" icon="upload">
                          Upload CSV
                        </MobileNavLink>
                        <MobileNavLink href="/uploads" icon="database">
                          Manage Uploads
                        </MobileNavLink>
                      </div>
                    </div>

                    {/* Footer in mobile menu */}
                    <div className="absolute bottom-8 left-6 right-6">
                      <div className="border-t border-white/10 pt-6">
                        <p className="text-xs text-white/40 text-center">
                          Events Dashboard
                        </p>
                        <p className="text-xs text-white/40 text-center mt-1">
                          Version 1.0.0
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative min-h-[calc(100vh-3rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}

// Navigation Link Component for Desktop
function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: string }) {
  const iconMap: { [key: string]: JSX.Element } = {
    dashboard: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    calendar: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    upload: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
    >
      {iconMap[icon]}
      {children}
    </Link>
  );
}

// Navigation Link Component for Mobile
function MobileNavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: string }) {
  const iconMap: { [key: string]: JSX.Element } = {
    dashboard: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    calendar: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    upload: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
    >
      <div className="text-primary">{iconMap[icon]}</div>
      {children}
    </Link>
  );
}