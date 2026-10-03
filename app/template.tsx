"use client";

import { motion } from "framer-motion";

// Short opacity-only transition so fixed/sticky descendants are never affected by a transform.
export default function Template({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }}>{children}</motion.div>;
}
