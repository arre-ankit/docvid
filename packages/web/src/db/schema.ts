import * as authSchema from "./auth.schema";
import * as lessonsSchema from "./lessons.schema";
import * as paymentsSchema from "./payments.schema";

export const schema = {
  ...authSchema,
  ...lessonsSchema,
  ...paymentsSchema,
} as const;

export * from "./auth.schema";
export * from "./lessons.schema";
export * from "./payments.schema";
