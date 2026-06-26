import * as authSchema from "./auth.schema";
import * as lessonsSchema from "./lessons.schema";

export const schema = {
  ...authSchema,
  ...lessonsSchema,
} as const;

export * from "./auth.schema";
export * from "./lessons.schema";
