"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { useFormStatus } from "react-dom";

type Props = {
  /** Server action that performs the delete. Omit together with `blocked`. */
  action?: (formData: FormData) => Promise<void>;
  /** Hidden inputs posted with the action, e.g. { id: plan.id }. */
  fields?: Record<string, string>;
  /** Text on the row button that opens the dialog. */
  triggerLabel: string;
  triggerStyle?: CSSProperties;
  /** Dialog heading, naming the item, e.g. `Delete plan "Pro"?` */
  title: string;
  /** What actually happens if they confirm. */
  children: ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  /**
   * The delete can't go ahead (e.g. the database would refuse it). The dialog
   * then only explains why, with a single Close button.
   */
  blocked?: boolean;
};

const RED = "var(--c-red)";
// Darker red for text / filled backgrounds so white-on-red and red-on-cream
// both clear 4.5:1.
const RED_INK = "var(--c-red-ink)";

/**
 * Row-level delete button that asks first. Opens a native modal <dialog>
 * naming the item and spelling out the consequences. The safe button gets
 * focus, Escape closes it (native), and focus returns to the trigger on close.
 */
export default function ConfirmDelete({
  action,
  fields = {},
  triggerLabel,
  triggerStyle,
  title,
  children,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  cancelLabel = "Keep",
  blocked = false,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const safeRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const descId = useId();

  function open() {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    safeRef.current?.focus();
  }

  function close() {
    dialogRef.current?.close();
  }

  const body = (
    <>
      <h2
        id={titleId}
        style={{
          margin: "0 0 10px",
          fontSize: 22,
          lineHeight: 1.25,
          color: "var(--ink)",
          whiteSpace: "normal",
        }}
      >
        {title}
      </h2>
      <div
        id={descId}
        style={{
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: "normal",
        }}
      >
        {children}
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        onClick={open}
        aria-haspopup="dialog"
        style={{ color: RED_INK, borderColor: RED, ...triggerStyle }}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        // Don't let Escape hide the dialog while the delete is in flight.
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        style={{
          width: "min(440px, calc(100vw - 32px))",
          padding: 24,
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "var(--bg)",
          color: "var(--ink)",
          boxShadow: "0 24px 64px rgba(20, 17, 16, 0.18)",
          textAlign: "left",
        }}
      >
        {blocked || !action ? (
          <div>
            {body}
            <div style={actionsRow}>
              <button ref={safeRef} type="button" className="btn btn-solid" onClick={close}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form action={action}>
            {Object.entries(fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            {body}
            <DialogActions
              safeRef={safeRef}
              onClose={close}
              onPendingChange={setBusy}
              confirmLabel={confirmLabel}
              pendingLabel={pendingLabel}
              cancelLabel={cancelLabel}
            />
          </form>
        )}
      </dialog>
    </>
  );
}

const actionsRow: CSSProperties = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  flexWrap: "wrap",
  marginTop: 22,
};

/** Lives inside the <form> so useFormStatus can see the delete's progress. */
function DialogActions({
  safeRef,
  onClose,
  onPendingChange,
  confirmLabel,
  pendingLabel,
  cancelLabel,
}: {
  safeRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    onPendingChange(pending);
    // Action finished. If the row is gone this component has unmounted; if
    // the action redirected back with an error, close so the message shows.
    if (wasPending.current && !pending) onClose();
    wasPending.current = pending;
  }, [pending, onPendingChange, onClose]);

  return (
    <div style={actionsRow}>
      <button
        ref={safeRef}
        type="button"
        className="btn btn-outline"
        onClick={onClose}
        disabled={pending}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className="btn btn-solid"
        disabled={pending}
        aria-busy={pending || undefined}
        style={{ background: RED_INK, color: "#fff" }}
      >
        {pending ? pendingLabel : confirmLabel}
      </button>
    </div>
  );
}
