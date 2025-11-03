import { z } from 'zod';

export const CatSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(['active', 'adopted', 'moved']),
  created_at: z.date()
});

export const CreateCatSchema = CatSchema.omit({ 
  id: true, 
  created_at: true 
});

export const UpdateCatStatusSchema = z.object({
  status: z.enum(['active', 'adopted', 'moved'])
});

export const QueryParamsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
  lon: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
  radius: z.string().regex(/^\d+\.?\d*$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export type Cat = z.infer<typeof CatSchema>;
export type CreateCatDTO = z.infer<typeof CreateCatSchema>;
export type UpdateCatStatusDTO = z.infer<typeof UpdateCatStatusSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;

export interface QueryBuilder {
  query: string;
  values: unknown[];
}