import { getCollection } from 'astro:content';

export type Category = 'data' | 'games' | 'tools';

/** Projects in one category, in their `order`. getCollection's own order is not stable. */
export async function byCategory(cat: Category) {
  const entries = await getCollection('projects', (e) => e.data.category === cat);
  return entries.sort((a, b) => a.data.order - b.data.order);
}
