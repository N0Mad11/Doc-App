export type Role = 'owner' | 'editor' | 'viewer' | 'none';

export function getRole(
  doc: { owner_id: string },
  userId: string,
  shares: { user_id: string; role: 'viewer' | 'editor' }[]
): Role {
  if (doc.owner_id === userId) return 'owner';
  return shares.find(s => s.user_id === userId)?.role ?? 'none';
}

export const canEdit = (role: Role) => role === 'owner' || role === 'editor';