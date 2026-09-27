import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import { Check } from '@phosphor-icons/react';

export default function Toast({ notice }: { notice: string }) {
  const reduce = useReducedMotion();
  return <LazyMotion features={domAnimation}><AnimatePresence>{notice && <m.div className="toast" role="status" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={18} />{notice}</m.div>}</AnimatePresence></LazyMotion>;
}
