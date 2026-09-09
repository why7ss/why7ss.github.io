import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const NAV = [
  { label: 'Навыки', href: '#skills' },
  { label: 'Портфолио', href: '#portfolio' },
  { label: 'Контакты', href: '#contact' },
]

export default function Header({ name }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className={
        'fixed top-0 inset-x-0 z-50 transition-colors duration-300 ' +
        (scrolled ? 'bg-base/85 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent')
      }
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-xl tracking-tight text-ink">
          {name}
          <span className="text-accent">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted hover:text-ink transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center border border-line px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent transition-colors duration-200 rounded-none"
        >
          Обсудить проект
        </a>

        <a
          href="#portfolio"
          className="md:hidden text-sm text-ink border border-line px-3 py-1.5"
        >
          Портфолио
        </a>
      </div>
    </motion.header>
  )
}
