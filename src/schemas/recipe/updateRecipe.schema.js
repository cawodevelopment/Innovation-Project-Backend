import { z } from 'zod';

const updateRecipeSchema = z
    .object({
        prompt: z.string().min(1)
    })
    .strict();

export default updateRecipeSchema;