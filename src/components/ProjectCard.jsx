import { motion } from 'framer-motion'
import { Github, Lock, ArrowUpRight } from 'lucide-react'

const TYPE_LABEL = {
  plugin: 'Плагин',
  mod: 'Мод',
  server: 'Сборка',
}

export default function ProjectCard({ project, wide = false }) {
  const isOpen = project.status === 'open'
  const Wrapper = isOpen ? 'a' : 'div'
  const wrapperProps = isOpen
    ? { href: project.githubUrl, target: '_blank', rel: 'noreferrer' }
    : {}

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)', transition: { duration: 0.25 } }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
      className={wide ? 'sm:col-span-2' : ''}
    >
      <Wrapper
        {...wrapperProps}
        className={`group relative flex h-full flex-col overflow-hidden border bg-surface transition-colors duration-300 ${
          isOpen
            ? 'border-accent/60 hover:border-accent cursor-pointer'
            : 'border-line hover:border-line'
        }`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface2">
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.04]"
          />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="border border-white/15 bg-base/70 backdrop-blur-sm px-2.5 py-1 text-xs text-ink">
              {TYPE_LABEL[project.type] ?? project.type}
            </span>
          </div>

          <div className="absolute right-4 top-4">
            {isOpen ? (
              <span className="inline-flex items-center gap-1.5 border border-accent/40 bg-base/70 backdrop-blur-sm px-2.5 py-1 text-xs text-accent-bright">
                Open Source
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-base/70 backdrop-blur-sm px-2.5 py-1 text-xs text-muted">
                <Lock size={11} strokeWidth={1.8} />
                Private / Closed Source
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl text-ink">{project.title}</h3>
            {isOpen && (
              <ArrowUpRight
                size={20}
                strokeWidth={1.6}
                className="mt-1 shrink-0 text-muted transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted flex-1">{project.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            {project.tags.map((tag) => (
              <span key={tag} className="font-mono text-[11px] text-muted/90 bg-surface2 px-2 py-1">
                {tag}
              </span>
            ))}
          </div>

          {isOpen && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted group-hover:text-accent transition-colors duration-300">
              <Github size={13} strokeWidth={1.8} />
              Смотреть код на GitHub
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  )
}