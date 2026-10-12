/** Opening and closing helpers for the native <dialog> popups (see Dialog.tsx). */

const openers = new WeakMap<HTMLDialogElement, Element | null>();

export function openDialog(id: string) {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
  openers.set(dialog, document.activeElement);
  // Lock page scroll; `scrollbar-gutter: stable` on <html> prevents a layout shift.
  document.documentElement.classList.add("dialog-open");
  dialog.showModal();
  dialog.querySelector("[data-dialog-scroll]")?.scrollTo({ top: 0 });
}

/** Called when a dialog closes (button, Escape or backdrop). */
export function afterDialogClose(dialog: HTMLDialogElement) {
  if (!document.querySelector("dialog[open]")) {
    document.documentElement.classList.remove("dialog-open");
  }
  const opener = openers.get(dialog);
  if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
}
