"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  /** Label shown while the parent form's server action is running. */
  pendingLabel?: ReactNode;
};

/**
 * Submit button for server-action forms. Reads the parent <form>'s status, so
 * it disables itself and swaps its label while the action runs. Stops a slow
 * save (e.g. one that also syncs to Razorpay) from looking like nothing
 * happened and inviting a second click.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" disabled={pending || disabled} aria-busy={pending || undefined}>
      {pending ? pendingLabel : children}
    </button>
  );
}
