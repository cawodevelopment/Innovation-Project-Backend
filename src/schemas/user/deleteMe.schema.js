import { z } from 'zod';

const deleteMeSchema = z
    .object({
        password: z.string().min(1)
    })
    .strict();

export default deleteMeSchema;