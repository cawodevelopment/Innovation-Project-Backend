import { z } from 'zod';

const addUserAllergenSchema = z
    .object({
        name: z.string().min(1)
    })
    .strict();

export default addUserAllergenSchema;
