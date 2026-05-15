"use client";

import { motion } from "framer-motion";
import React from "react";

type FadeInPanelProps = React.ComponentProps<typeof motion.div> & {
  delay?: number; // milliseconds
};

export default function FadeInPanel({ children, className = "", delay = 0, style, ...rest }: FadeInPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: delay / 1000, ease: "easeOut" }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export { FadeInPanel };
