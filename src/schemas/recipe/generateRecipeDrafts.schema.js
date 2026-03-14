import { z } from 'zod';

const generateRecipeDraftsSchema = z
    .object({
        prompt: z.string().min(1).optional(),
    })
    .passthrough();

export default generateRecipeDraftsSchema;