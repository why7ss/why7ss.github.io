import { motion } from 'framer-motion'
import { Github, Lock, Maximize2 } from 'lucide-react'

const TYPE_LABEL = {
  plugin: 'Плагин',
  mod: 'Мод',
  server: 'Сборка',
}

export default function ProjectCard({ project, wide = false, onClick }) {
  const isOpen = project.status === 'open'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)', transition: { duration: 0.25 } }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
      className={wide ? 'sm:col-span-2' : ''}
    >
      <div
        onClick={onClick}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden border border-line bg-surface transition-colors duration-300 hover:border-accent/60"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface2">
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.04]"
          />

          {/* Иконка быстрой подсказки открытия */}
          <div className="absolute inset-0 bg-base/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 border border-white/20 bg-base/80 backdrop-blur-md px-3 py-1.5 text-xs text-ink font-mono transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Maximize2 size={13} className="text-accent" />
              Подробнее
            </span>
          </div>

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
            <h3 className="font-display text-2xl text-ink group-hover:text-accent-bright transition-colors duration-200">
              {project.title}
            </h3>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted flex-1 line-clamp-3">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            {project.tags.map((tag) => (
              <span key={tag} className="font-mono text-[11px] text-muted/90 bg-surface2 px-2 py-1">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 inline-flex items-center justify-between text-xs text-muted group-hover:text-ink transition-colors duration-300">
            <span className="inline-flex items-center gap-1.5">
              {isOpen && <Github size={13} strokeWidth={1.8} className="text-accent" />}
              {isOpen ? 'Есть сурсы на GitHub' : 'Приватная разработка'}
            </span>
            <span className="font-mono text-[11px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              Открыть →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}