import { z } from 'zod';

const addUserDietaryPreferenceSchema = z
    .object({
        name: z.string().min(1)
    })
    .strict();

export default addUserDietaryPreferenceSchema;
