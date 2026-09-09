import { Coffee, Server, Boxes, Layers, Database, GitBranch, Gauge, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import { RevealGroup, RevealItem } from './Reveal.jsx'

const ICON_MAP = { Coffee, Server, Boxes, Layers, Database, GitBranch, Gauge, Box }

const SPAN = {
  lg: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  md: 'sm:col-span-2 lg:col-span-2 lg:row-span-1',
  sm: 'sm:col-span-1 lg:col-span-1 lg:row-span-1',
}

function SkillCard({ skill }) {
  const Icon = ICON_MAP[skill.icon] ?? Box
  const large = skill.size === 'lg'

  return (
    <RevealItem
      className={`group relative flex flex-col justify-between overflow-hidden border border-line bg-surface p-6 md:p-7 transition-colors duration-300 hover:border-accent/60 ${SPAN[skill.size] ?? SPAN.sm}`}
    >
      <div className="flex items-start justify-between">
        <Icon
          size={large ? 34 : 26}
          strokeWidth={1.4}
          className="text-accent transition-transform duration-300 ease-out-quart group-hover:-translate-y-0.5"
        />
      </div>

      <div className="mt-6">
        <h3 className={`font-display text-ink ${large ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
          {skill.title}
        </h3>
        <p
          className={`mt-2.5 text-muted leading-relaxed ${
            large ? 'text-base max-w-sm line-clamp-3' : 'text-sm line-clamp-2'
          }`}
        >
          {skill.description}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-accent/[0.04] to-transparent" />
    </RevealItem>
  )
}

export default function Skills({ skills }) {
  return (
    <section id="skills" className="relative border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className="mb-14 max-w-xl"
        >
          <h2 className="font-display text-4xl md:text-5xl text-ink text-balance">
            Инструменты, на которых держится продакшен
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            От логики на сервере до архитектуры сборки - стек, которым закрываю задачи любого
            масштаба.
          </p>
        </motion.div>

        <RevealGroup
          as="div"
          stagger={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(200px,auto)] gap-3 md:gap-4"
        >
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
