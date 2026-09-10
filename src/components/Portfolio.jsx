import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import ProjectCard from './ProjectCard.jsx'
import ProjectModal from './ProjectModal.jsx'

const FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'plugin', label: 'Плагины' },
  { key: 'mod', label: 'Моды' },
  { key: 'server', label: 'Сборки' },
]

export default function Portfolio({ projects }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      const matchesType = activeFilter === 'all' || p.type === activeFilter
      if (!matchesType) return false
      if (!q) return true
      const haystack = [p.title, p.description, ...(p.tags ?? [])].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [projects, activeFilter, query])

  return (
    <section id="portfolio" className="relative border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-10 max-w-xl">
          <h2 className="font-display text-4xl md:text-5xl text-ink text-balance">Портфолио</h2>
          <p className="mt-4 text-muted leading-relaxed">
            {projects.length} проектов: от открытых плагинов до приватных сборок под заказ.
          </p>
        </div>

        <div className="sticky top-16 z-30 -mx-6 md:-mx-10 mb-10 border-y border-line bg-base/90 backdrop-blur-md px-6 md:px-10 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex items-center gap-6">
              {FILTERS.map((f) => {
                const active = activeFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`relative pb-1 text-sm transition-colors duration-200 ${
                      active ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {f.label}
                    {active && (
                      <motion.span
                        layoutId="filter-underline"
                        className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-accent"
                        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, тегу..."
                className="w-full bg-transparent border-b border-line focus:border-accent py-1.5 pl-6 pr-6 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors duration-200"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Очистить поиск"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                wide={i % 5 === 0}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-line py-20 text-center">
            <p className="text-muted">Ничего не найдено. Попробуйте другой запрос или фильтр.</p>
          </div>
        )}
      </div>

      {/* Окно детального просмотра */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  )
}