import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Lock, ExternalLink, Code2, Sparkles } from 'lucide-react'

const TYPE_LABEL = {
  plugin: 'Плагин',
  mod: 'Мод',
  server: 'Сборка',
}

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!project) return null

  const isOpen = project.status === 'open'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
        {/* Затемнение фона */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-base/85 backdrop-blur-md"
        />

        {/* Окно модалки */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden border border-line bg-surface shadow-2xl z-10"
        >
          {/* Шапка модалки */}
          <div className="flex items-center justify-between border-b border-line bg-surface2/80 px-6 py-4 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="border border-white/10 bg-base/60 px-2.5 py-1 text-xs font-mono text-ink">
                {TYPE_LABEL[project.type] ?? project.type}
              </span>
              <span className="text-line">•</span>
              {isOpen ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-accent-bright font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-bright animate-pulse" />
                  Open Source
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted font-mono">
                  <Lock size={12} strokeWidth={1.8} />
                  Private Project
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-ink hover:bg-surface transition-colors border border-transparent hover:border-line"
              aria-label="Закрыть окно"
            >
              <X size={18} />
            </button>
          </div>

          {/* Тело модалки со скроллом */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Обложка проекта */}
            {project.image && (
              <div className="relative aspect-[21/9] w-full bg-black/50 border-b border-line overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover select-none"
                />
              </div>
            )}

            <div className="p-6 md:p-10 space-y-8">
              {/* Заголовок и базовое описание */}
              <div className="space-y-4">
                <h3 className="font-display text-3xl md:text-5xl text-ink font-bold tracking-tight">
                  {project.title}
                </h3>
                <p className="text-base md:text-lg text-muted/90 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Теги технологий */}
              <div className="border-y border-line/60 py-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted mb-3">
                  <Code2 size={14} className="text-accent" />
                  <span>Стек технологий</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-ink/90 bg-surface2 border border-line/80 px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Динамический блочный контент (статья / детали проекта) */}
              {project.content && project.content.length > 0 && (
                <div className="space-y-6 pt-2">
                  {project.content.map((block, index) => {
                    // Заголовок секции
                    if (block.type === 'heading') {
                      return (
                        <h4
                          key={index}
                          className="font-display text-xl md:text-2xl text-ink font-semibold pt-4 border-t border-line/40 first:border-none first:pt-0"
                        >
                          {block.value}
                        </h4>
                      )
                    }

                    // Текст
                    if (block.type === 'text') {
                      return (
                        <p
                          key={index}
                          className="text-base leading-relaxed text-muted/90 whitespace-pre-line"
                        >
                          {block.value}
                        </p>
                      )
                    }

                    // Картинка или Гифка
                    if (block.type === 'image' || block.type === 'gif') {
                        return (
                        <figure key={index} className="space-y-2 my-4">
                            <div className="overflow-hidden border border-line bg-surface2">
                            <img
                                src={block.url}
                                alt={block.caption || ''}
                                loading="lazy"
                                className="w-full h-auto object-cover max-h-[500px]"
                            />
                            </div>
                            {block.caption && (
                            <figcaption className="text-center text-xs font-mono text-muted">
                                — {block.caption}
                            </figcaption>
                            )}
                        </figure>
                        )
                    }

                    // Видео (.mp4, .webm)
                    if (block.type === 'video') {
                        return (
                        <figure key={index} className="space-y-2 my-4">
                            <div className="overflow-hidden border border-line bg-surface2">
                            <video
                                src={block.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-auto max-h-[500px] object-cover"
                            />
                            </div>
                            {block.caption && (
                            <figcaption className="text-center text-xs font-mono text-muted">
                                — {block.caption}
                            </figcaption>
                            )}
                        </figure>
                        )
                    }

                    return null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Подвал с действиями */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line bg-surface2/80 p-5 md:px-8 shrink-0">
            <span className="text-xs font-mono text-muted">
              {isOpen ? 'Исходный код открыт' : 'Приватная разработка'}
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none border border-line bg-surface px-5 py-2.5 text-xs font-mono text-muted hover:text-ink hover:border-muted/40 transition-colors"
              >
                Закрыть
              </button>

              {isOpen && project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-accent/60 bg-accent/10 px-5 py-2.5 text-xs font-mono text-accent-bright hover:bg-accent hover:text-base transition-all duration-300"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}