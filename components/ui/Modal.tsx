"use client";
import { IconButton } from "@/components/ui/IconButton";
import styles from "./Modal.module.css";
import { ReactNode, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, description, children, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", onClose);

    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={styles.dialog}>
      <div className={styles.header}>
        <h2 className={`text-preset-1 ${styles.title}`}>{title}</h2>
        <IconButton
          onClick={() => dialogRef.current?.close()}
          icon="/images/icon-close-modal.svg"
          label="Close"
          className={styles.close}
        />
      </div>

      <p className={`text-preset-4 ${styles.description}`}>{description}</p>

      {children}
    </dialog>
  );
}
