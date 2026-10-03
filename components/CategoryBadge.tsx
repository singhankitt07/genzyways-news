"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage, translateCategory, categorySlugFor } from "@/lib/i18n";
import { fadeIn, viewportOnce } from "@/lib/motion";

const MotionLink = motion.create(Link);

export default function CategoryBadge({ category }: { category: string }) {
  const { lang } = useLanguage();
  return (
    <MotionLink
      href={`/category/${categorySlugFor(category)}`}
      className="text-xs uppercase tracking-wide text-press font-semibold hover:underline"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {translateCategory(category, lang)}
    </MotionLink>
  );
}
