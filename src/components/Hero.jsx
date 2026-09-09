import { motion } from 'framer-motion'
import { Github, MessageCircle, Send, Mail, ArrowDownRight } from 'lucide-react'

const ICONS = { github: Github, discord: MessageCircle, telegram: Send, mail: Mail }

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
  },
}

export default function Hero({ profile }) {
  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-28 md:pt-52 md:pb-36">
      {/* subtle isometric wireframe accent, desktop only */}
      <svg
        className="pointer-events-none absolute -right-24 top-24 hidden lg:block opacity-[0.35]"
        width="420"
        height="420"
        viewBox="0 0 420 420"
        fill="none"
      >
        <g stroke="#232326" strokeWidth="1">
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => {
              const s = 90
              const cx = 60 + col * s * 1.05 + (row % 2 ? s * 0.5 : 0)
              const cy = 20 + row * s * 0.9
              return (
                <path
                  key={`${row}-${col}`}
                  d={`M${cx},${cy} L${cx + 52},${cy + 26} L${cx},${cy + 52} L${cx - 52},${cy + 26} Z M${cx - 52},${cy + 26} L${cx},${cy + 52} L${cx},${cy + 104} L${cx - 52},${cy + 78} Z M${cx + 52},${cy + 26} L${cx},${cy + 52} L${cx},${cy + 104} L${cx + 52},${cy + 78} Z`}
                />
              )
            })
          )}
        </g>
        <g stroke="#6B9080" strokeWidth="1.4" opacity="0.7">
          <path d="M270,116 L322,142 L270,168 L218,142 Z M218,142 L270,168 L270,220 L218,194 Z M322,142 L270,168 L270,220 L322,194 Z" />
        </g>
      </svg>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-6xl px-6 md:px-10"
      >
        <motion.div variants={item} className="flex items-center gap-2.5 text-sm text-muted mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {profile.availability} · {profile.location}
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display font-medium text-balance text-7xl sm:text-8xl md:text-[8.5rem] leading-[0.92] tracking-tightest text-ink"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-2xl font-display italic text-2xl md:text-3xl text-ink/90 text-balance"
        >
          {profile.tagline}
        </motion.p>

        <motion.p variants={item} className="mt-6 max-w-xl text-muted leading-relaxed">
          {profile.bio}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#portfolio"
            className="group inline-flex items-center gap-2 bg-ink text-base px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors duration-300"
          >
            Смотреть портфолио
            <ArrowDownRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>

          <div className="flex items-center gap-2">
            {profile.socials.map((s) => {
              const Icon = ICONS[s.icon] ?? Mail
              return (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-11 w-11 items-center justify-center border border-line text-muted hover:text-accent hover:border-accent transition-colors duration-300"
                >
                  <Icon size={18} strokeWidth={1.6} />
                </a>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
