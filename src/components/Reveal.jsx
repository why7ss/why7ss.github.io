import { motion } from 'framer-motion'

const variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
  },
}

/**
 * Wraps children in a scroll-triggered fade-up + blur-to-clear reveal.
 * Pass `delay` to stagger siblings manually, or use <RevealGroup> for
 * automatic staggering of direct children.
 */
export default function Reveal({ children, as = 'div', delay = 0, className, once = true, amount = 0.3 }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ ...variants.visible.transition, delay }}
    >
      {children}
    </Comp>
  )
}

export function RevealGroup({ children, as = 'div', className, stagger = 0.08, once = true, amount = 0.2 }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({ children, as = 'div', className }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  )
}
