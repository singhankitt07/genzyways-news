"use client";

import { MotionConfig, motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn, fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Tag = "div" | "section" | "article" | "aside" | "li" | "ol" | "ul" | "span";
const tags = { div: motion.div, section: motion.section, article: motion.article, aside: motion.aside, li: motion.li, ol: motion.ol, ul: motion.ul, span: motion.span };

type BaseProps = { children: ReactNode; className?: string; as?: Tag };

// Disables transform-based motion automatically for users who prefer reduced motion.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

// Fades up once when scrolled into view.
export function Reveal({ children, className, as = "div", delay = 0, fade = false }: BaseProps & { delay?: number; fade?: boolean }) {
  const Comp = tags[as];
  return (
    <Comp className={className} variants={fade ? fadeIn : fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} transition={delay ? { delay } : undefined}>
      {children}
    </Comp>
  );
}

// Container that reveals its <StaggerItem> children one after another once in view.
export function Stagger({ children, className, as = "div", gap = 0.07, delay = 0 }: BaseProps & { gap?: number; delay?: number }) {
  const Comp = tags[as];
  return (
    <Comp className={className} variants={stagger(gap, delay)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div", fade = false }: BaseProps & { fade?: boolean }) {
  const Comp = tags[as];
  return <Comp className={className} variants={fade ? fadeIn : fadeUp}>{children}</Comp>;
}

// Mount-time sequence (no scroll trigger) used for above-the-fold content such as article headers.
export function Sequence({ children, className, gap = 0.09 }: Omit<BaseProps, "as"> & { gap?: number }) {
  return <motion.div className={className} variants={stagger(gap)} initial="hidden" animate="visible">{children}</motion.div>;
}

export function SequenceItem({ children, className }: Omit<BaseProps, "as">) {
  return <motion.div className={className} variants={fadeUp}>{children}</motion.div>;
}

// Card wrapper: fade-up on entering the viewport plus a very subtle hover lift.
export function MotionCard({ children, className }: Omit<BaseProps, "as">) {
  return (
    <motion.div className={className} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}>
      {children}
    </motion.div>
  );
}
