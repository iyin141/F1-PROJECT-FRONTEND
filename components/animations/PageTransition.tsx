"use client";

import { motion } from "framer-motion";
import React from "react";

type PageTransitionProps = React.ComponentProps<typeof motion.div>;

export default function PageTransition({ children, className = "", style, ...rest }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export { PageTransition };
