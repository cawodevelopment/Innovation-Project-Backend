import { z } from 'zod';

const updateMeSchema = z
    .object({
        firstname: z.string().min(1).optional(),
        lastname: z.string().min(1).optional()
    })
    .strict();

export default updateMeSchema;