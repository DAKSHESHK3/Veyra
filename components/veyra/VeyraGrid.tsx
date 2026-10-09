import React from "react";
import { cn } from "@/lib/utils";

interface VeyraGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function VeyraGrid({
  columns = 4,
  children,
  className,
  ...props
}: VeyraGridProps) {
  const colClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4", colClass, className)} {...props}>
      {children}
    </div>
  );
}
