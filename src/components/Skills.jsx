import { Coffee, Server, Boxes, Layers, Database, GitBranch, Gauge, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import { RevealGroup, RevealItem } from './Reveal.jsx'

const ICON_MAP = { Coffee, Server, Boxes, Layers, Database, GitBranch, Gauge, Box }

// Перешли на 12-колоночную сетку для более гибокого распределения ширины
const SPAN = {
  lg: 'col-span-12 md:col-span-6 lg:col-span-6',
  md: 'col-span-12 md:col-span-6 lg:col-span-4',
  sm: 'col-span-12 md:col-span-6 lg:col-span-3',
}

function SkillCard({ skill }) {
  const Icon = ICON_MAP[skill.icon] ?? Box
  
  // Автоматический расчет требуемого размера, если он не задан явно
  const descLength = skill.description?.length || 0
  const derivedSize = skill.size || (descLength > 120 ? 'lg' : descLength > 60 ? 'md' : 'sm')
  const large = derivedSize === 'lg'

  return (
    <RevealItem
      className={`group relative flex flex-col justify-between overflow-hidden border border-line bg-surface p-6 md:p-8 transition-all duration-300 hover:border-accent/60 ${SPAN[derivedSize] ?? SPAN.sm}`}
    >
      <div className="flex items-start justify-between">
        <Icon
          size={large ? 32 : 24}
          strokeWidth={1.4}
          className="text-accent transition-transform duration-300 ease-out-quart group-hover:-translate-y-0.5"
        />
      </div>

      <div className="mt-8 flex flex-col justify-end h-full">
        <h3 className={`font-display text-ink font-semibold ${large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
          {skill.title}
        </h3>
        <p
          className={`mt-2.5 text-muted leading-relaxed ${
            large ? 'text-base opacity-90' : 'text-sm opacity-80'
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
            От логики на сервере до архитектуры сборки — стек, которым закрываю задачи любого масштаба.
          </p>
        </motion.div>

        <RevealGroup
          as="div"
          stagger={0.08}
          className="grid grid-cols-12 gap-4 md:gap-5"
        >
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}