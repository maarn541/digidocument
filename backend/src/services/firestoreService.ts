/**
 * MongoDB has fully replaced Firebase Firestore.
 * This file is intentionally kept as a stub so existing imports
 * do not break during the transition. All operations are now
 * performed directly on MongoDB via Mongoose models.
 */

export const FirestoreService = {
  // No-op — data is now in MongoDB
  async syncUser(_user: any, _profile?: any): Promise<void> {},
  async deleteUser(_userId: string): Promise<void> {},
  async syncRequest(_reqData: any): Promise<void> {},
  async syncGeneratedDoc(_docData: any): Promise<void> {},
  async syncAllFromPrisma(_prisma: any): Promise<object> { return {}; },
};
