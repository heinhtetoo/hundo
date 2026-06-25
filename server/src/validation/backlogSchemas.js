const { z } = require('zod');

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];

const addToBacklogSchema = z.object({
  rawgId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  coverImageUrl: z.string().nullable().optional(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  platforms: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  releaseYear: z.number().int().min(1950).max(2100).nullable().optional(),
  status: z.enum(STATUSES).optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  hoursPlayed: z.number().min(0).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const updateBacklogSchema = z.object({
  status: z.enum(STATUSES).optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  hoursPlayed: z.number().min(0).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

module.exports = { addToBacklogSchema, updateBacklogSchema, STATUSES };
