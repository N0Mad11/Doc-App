import { describe, expect, it } from 'vitest';
import { canEdit, getRole } from './permissions';

const doc = { owner_id: 'alice' };
const shares = [
  { user_id: 'bob', role: 'editor' as const },
  { user_id: 'carol', role: 'viewer' as const },
];

describe('getRole / canEdit', () => {
  it('owner can edit', () => {
    expect(getRole(doc, 'alice', shares)).toBe('owner');
    expect(canEdit('owner')).toBe(true);
  });
  it('editor can edit, viewer cannot', () => {
    expect(canEdit(getRole(doc, 'bob', shares))).toBe(true);
    expect(canEdit(getRole(doc, 'carol', shares))).toBe(false);
  });
  it('strangers have no access', () => {
    expect(getRole(doc, 'dave', shares)).toBe('none');
    expect(canEdit('none')).toBe(false);
  });
});