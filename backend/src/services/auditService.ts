import { Notification, AuditLog } from '../models/index.js';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
  link?: string
) {
  try {
    return await Notification.create({ userId, title, message, type, link });
  } catch (err) {
    console.error('Failed to create notification', err);
  }
}

export async function createAuditLog(
  userId: string | null,
  requestId: string | null,
  action: string,
  metadata?: any,
  ipAddress?: string
) {
  try {
    return await AuditLog.create({
      userId: userId || undefined,
      requestId: requestId || undefined,
      action,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
}
