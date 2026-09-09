import { Github, MessageCircle, Send, Mail } from 'lucide-react'

const ICONS = { github: Github, discord: MessageCircle, telegram: Send, mail: Mail }

export default function Footer({ profile }) {
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="relative border-t border-line py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              Есть задача? <span className="text-muted">Обсудим детали.</span>
            </h2>
            <a
              href={profile.socials.find((s) => s.icon === 'mail')?.url ?? '#'}
              className="mt-5 inline-flex items-center gap-2 border border-line px-6 py-3.5 text-sm text-ink hover:border-accent hover:text-accent transition-colors duration-300"
            >
              Написать на почту
            </a>
          </div>

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
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} {profile.name}. Все права защищены.</p>
          <p>Java · Spigot/Paper · Forge/Fabric · Sponge</p>
        </div>
      </div>
    </footer>
  )
}
