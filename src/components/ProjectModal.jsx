import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Lock, ExternalLink, Code2, Maximize2 } from 'lucide-react'

// Импорты для Lightbox и плагина Zoom
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

const TYPE_LABEL = {
  plugin: 'Плагин',
  mod: 'Мод',
  server: 'Сборка',
}

export default function ProjectModal({ project, onClose }) {
  // Состояние для активного изображения в лайтбоксе (null, если закрыт)
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !lightboxImg) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, lightboxImg])

  if (!project) return null

  const isOpen = project.status === 'open'

  return (
    <>
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
            {/* Шапка */}
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

            {/* Тело со скроллом */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Главная обложка (тоже кликабельна для просмотра) */}
              {project.image && (
                <div
                  onClick={() => setLightboxImg(project.image)}
                  className="group relative aspect-[21/9] w-full bg-black/50 border-b border-line overflow-hidden cursor-zoom-in"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-base/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 border border-white/20 bg-base/80 backdrop-blur-md px-3 py-1.5 text-xs text-ink font-mono">
                      <Maximize2 size={13} className="text-accent" />
                      Открыть во весь экран
                    </span>
                  </div>
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

                {/* Стек технологий */}
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

                {/* Блочный контент */}
                {project.content && project.content.length > 0 && (
                  <div className="space-y-6 pt-2">
                    {project.content.map((block, index) => {
                      // Heading
                      if (block.type === 'heading') {
                        return (
                          <div key={index} className="pt-6 pb-1 border-t border-line/40 first:border-none first:pt-0">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs text-accent font-bold px-1.5 py-0.5 bg-accent/10 border border-accent/30 rounded-sm">
                                #
                              </span>
                              <h4 className="text-xl md:text-2xl text-ink font-bold tracking-tight">
                                {block.value}
                              </h4>
                            </div>
                          </div>
                        )
                      }

                      // Text
                      if (block.type === 'text') {
                        return (
                          <p key={index} className="text-sm md:text-base leading-relaxed text-muted/90 whitespace-pre-line font-normal">
                            {block.value}
                          </p>
                        )
                      }

                      // Image / GIF
                      if (block.type === 'image' || block.type === 'gif') {
                        return (
                          <figure key={index} className="space-y-2 my-5">
                            <div
                              onClick={() => setLightboxImg(block.url)}
                              className="group relative overflow-hidden border border-line bg-surface2 cursor-zoom-in"
                            >
                              <img
                                src={block.url}
                                alt={block.caption || ''}
                                loading="lazy"
                                className="w-full h-auto object-cover max-h-[500px] transition-transform duration-500 group-hover:scale-[1.01]"
                              />
                              <div className="absolute inset-0 bg-base/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="inline-flex items-center gap-2 border border-white/20 bg-base/80 backdrop-blur-md px-3 py-1.5 text-xs text-ink font-mono">
                                  <Maximize2 size={13} className="text-accent" />
                                  Приблизить
                                </span>
                              </div>
                            </div>
                            {block.caption && (
                              <figcaption className="text-center text-xs font-mono text-muted">
                                — {block.caption}
                              </figcaption>
                            )}
                          </figure>
                        )
                      }

                      // Video
                      if (block.type === 'video') {
                        return (
                          <figure key={index} className="space-y-2 my-5">
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

            {/* Подвал */}
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

      {/* Полноэкранный просмотр изображений с зумом */}
      <Lightbox
        open={Boolean(lightboxImg)}
        close={() => setLightboxImg(null)}
        slides={lightboxImg ? [{ src: lightboxImg }] : []}
        plugins={[Zoom]}
        controller={{ closeOnBackdropClick: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
        }}
      />
    </>
  )
}