"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { afterDialogClose } from "./dialogs";
import styles from "./Dialog.module.css";

type DialogProps = {
  id: string;
  /** Id of the heading that names the dialog. */
  labelledBy: string;
  closeLabel: string;
  /** `service` and `article` share the glass shell; `media` shows a single image. */
  variant?: "service" | "article" | "media";
  children: ReactNode;
};

/**
 * Liquid-glass popup built on the native <dialog> element: the rest of the page
 * becomes inert, Escape closes it, and focus returns to the control that opened it.
 * Content is rendered on the server, so it is part of the static HTML.
 */
export function Dialog({ id, labelledBy, closeLabel, variant = "service", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Close on a backdrop click, but not when a text selection started inside ends outside.
    let pressedOutside = false;
    const onPointerDown = (event: PointerEvent) => {
      pressedOutside = event.target === dialog;
    };
    const onClick = (event: MouseEvent) => {
      if (pressedOutside && event.target === dialog) dialog.close();
      pressedOutside = false;
    };
    const onClose = () => afterDialogClose(dialog);
    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("click", onClick);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("click", onClick);
      dialog.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <dialog ref={ref} id={id} aria-labelledby={labelledBy} className={cx(styles.dialog, styles[variant])}>
      <GlassPanel
        strong
        grain
        ink={variant === "media" ? false : "mixed"}
        animateInk
        inkSpeed={26}
        inkSubtle={variant === "article"}
        className={styles.surface}
      >
        <button type="button" className={styles.close} onClick={() => ref.current?.close()}>
          <Icon name="close" size={20} />
          <span className="sr-only">{closeLabel}</span>
        </button>
        <div className={styles.scroll} data-dialog-scroll>
          {children}
        </div>
      </GlassPanel>
    </dialog>
  );
}
