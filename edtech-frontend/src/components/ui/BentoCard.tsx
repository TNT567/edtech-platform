'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BentoCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export function BentoCard({ children, className, title, icon, ...props }: BentoCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100",
        "transition-shadow duration-300 hover:shadow-md",
        className
      )}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      {...props}
    >
      {/* Optional Header */}
      {(title || icon) && (
        <div className="mb-6 flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              {icon}
            </div>
          )}
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        </div>
      )}
      
      {/* Content */}
      <div className="h-full w-full">{children}</div>
    </motion.div>
  );
}
