import type { JsonValue } from "../types/complexObject";


export const isPlainObject = (value: unknown): value is Record<string, JsonValue> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const SAMPLE: JsonValue = {
  id: 'org-2048',
  name: 'Northwind Labs',
  active: true,
  stats: { headcount: 128, regions: 4, uptime: 0.9992 },
  tags: ['pdf', 'automation', 'design-system'],
  contacts: [
    { id: 'contact-1', role: 'owner', email: 'owner@example.com', prefs: { theme: 'dark', notify: true } },
    { id: 'contact-2', role: 'billing', email: 'billing@example.com', prefs: { theme: 'light', notify: false } },
  ],
  metadata: {
    createdAt: '2024-11-03T08:12:00Z',
    nested: { deep: { note: '任意深度对象都可递归渲染' } },
  },
}


// 联合类型作为键
type Permission = "read" | "write" | "delete" | string;
type RolePermissions = Record<Permission, boolean>;

const adminPerms: RolePermissions = {
  read: true,
  write: true,
  bit: true,
  delete: true,  // 必须包含所有 Permission 中的键
};
