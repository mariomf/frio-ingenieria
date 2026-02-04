'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import { NAV_ITEMS, COMPANY } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-14 w-50 items-center justify-center rounded-lg bg-[#ffffff] text-white font-heading font-bold text-xl">
            <img
              src="/images/og-image.jpg"
              className="w-full h-full object-cover"
            />
          </div>
          {/*<div className="hidden sm:block">
            <div className="font-heading font-bold text-lg text-primary-900">Frío Ingeniería</div>
            <div className="text-xs text-industrial-500">Refrigeración Industrial</div>
          </div>*/}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-industrial-600 hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${COMPANY.phone}`}
            className="flex items-center gap-2 text-sm font-medium text-industrial-600 hover:text-primary-600"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden xl:inline">{COMPANY.phone}</span>
          </a>
          <Link href="/contacto">
            <Button>Cotizar</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav className="container mx-auto px-4 py-4 space-y-1 border-t">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-industrial-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 space-y-2">
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-industrial-600"
            >
              <Phone className="h-5 w-5" />
              {COMPANY.phone}
            </a>
            <Link href="/contacto" className="block">
              <Button className="w-full">Cotizar Proyecto</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
