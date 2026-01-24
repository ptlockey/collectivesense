'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavProps {
  user: { id: string; email: string } | null
  isAdmin?: boolean
}

export function Nav({ user, isAdmin = false }: NavProps) {
  const pathname = usePathname()

  const navLinks = user
    ? [
        { href: '/contribute', label: 'Help Others' },
        { href: '/submit', label: 'Get Wisdom' },
        { href: '/my-contributions', label: 'My Contributions' },
        { href: '/my-problems', label: 'My Requests' },
      ]
    : []

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary-dark"
          >
            <Image
              src="/logo.svg"
              alt="Collective Sense"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="hidden sm:inline">Collective Sense</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  pathname === link.href
                    ? 'bg-accent text-primary font-medium'
                    : 'text-secondary hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-xs text-secondary hidden sm:inline px-2">
                  {user.email}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm text-secondary hover:text-foreground rounded-md transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/login"
                  className={cn(
                    'px-3 py-2 text-sm rounded-md transition-colors',
                    pathname === '/login'
                      ? 'text-primary font-medium'
                      : 'text-secondary hover:text-foreground'
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
