import { z } from 'zod';

const publishRecipeDraftSchema = z.any().transform(() => ({}));

export default publishRecipeDraftSchema;