"use client";

import type { ReactNode } from "react";
import { openDialog } from "./dialogs";

type DialogTriggerProps = {
  /** Id of the <Dialog> to open. */
  target: string;
  className?: string;
  children: ReactNode;
};

export function DialogTrigger({ target, className, children }: DialogTriggerProps) {
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-controls={target}
      onClick={() => openDialog(target)}
    >
      {children}
    </button>
  );
}
