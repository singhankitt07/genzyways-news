"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type TrendingItem = { title: string; slug: string; category: string };

const numberVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function Trending({ items }: { items: TrendingItem[] }) {
  return (
    <motion.aside className="rounded-xl border border-line bg-surface p-5" aria-label="Trending stories" variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3"><h2 className="font-serif text-2xl">ट्रेंडिंग</h2><span className="text-xs font-semibold uppercase tracking-widest text-press">Now</span></div>
      <motion.ol className="space-y-4" variants={stagger(0.08, 0.1)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        {items.map((item, index) => (
          <motion.li key={item.slug} className="flex gap-3" variants={fadeUp}>
            <motion.span className="inline-block font-serif text-2xl text-press/70" variants={numberVariants}>{String(index + 1).padStart(2, "0")}</motion.span>
            <div><p className="text-[11px] uppercase tracking-wide text-ink/50">{item.category}</p><Link href={`/article/${item.slug}`} className="font-semibold leading-snug hover:text-press">{item.title}</Link></div>
          </motion.li>
        ))}
      </motion.ol>
    </motion.aside>
  );
}

