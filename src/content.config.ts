import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stat = z.object({ value: z.string(), label: z.string() });

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['data', 'games', 'tools']),
      order: z.number().int(),
      summary: z.string(),
      stats: z.array(stat).max(2).default([]),
      facts: z.array(z.string()).min(2).max(3),
      tags: z.array(z.string()).min(1),
      // The first link is the main (filled) button.
      links: z.array(z.object({ label: z.string(), url: z.string().url(), note: z.string().optional() })).default([]),
      media: z
        .object({
          image: image().optional(),
          // Muted loop served from public/, e.g. /media/long-dives.mp4. Needs an image as its poster.
          video: z.string().startsWith('/media/').optional(),
          alt: z.string().optional(),
          // 'contain' shows charts whole on white; screenshots default to a top-anchored crop.
          fit: z.enum(['cover', 'contain']).default('cover'),
          // Big-number panel for projects with nothing to screenshot.
          panel: z.array(stat).min(1).max(3).optional(),
        })
        .refine((m) => m.image || m.panel, { message: 'media needs an image or a panel' })
        .refine((m) => !m.video || m.image, { message: 'a video needs an image for its poster' })
        .refine((m) => !m.image || m.alt, { message: 'an image needs alt text' }),
      status: z.string().optional(),
    }),
});

export const collections = { projects };
