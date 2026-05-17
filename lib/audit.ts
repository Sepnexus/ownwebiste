import { db, schema } from "./db";

export type AuditActor = {
  userId: string | null;
  email: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuditEntry = {
  actor: AuditActor;
  action: string; // canonical, e.g. 'plan.create', 'customer.invite', 'subscription.cancel'
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
};

/**
 * Append a row to audit_logs. Failure is swallowed — we never want a logging
 * problem to break the user's action.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(schema.auditLogs).values({
      actorUserId: entry.actor.userId ?? null,
      actorEmail: entry.actor.email ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      details: entry.details ?? null,
      ipAddress: entry.actor.ipAddress ?? null,
      userAgent: entry.actor.userAgent ?? null,
    });
  } catch (e) {
    console.error("[audit] failed to write log:", e);
  }
}
