import z from "zod";

export const CreateAgent = z.object({
  code: z.string(),
  name: z.string(),
  address: z.string(),
  contact: z.string(),
  identity: z.string(),
});

export const UpdateAgent = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  identity: z.string().optional(),
});

export const AgentIdParam = z.object({ id: z.uuid() });

export const AgentEntity = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  address: z.string(),
  contact: z.string(),
  identity: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgentList = z.object({
  items: z.array(AgentEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateAgent = z.infer<typeof CreateAgent>;
export type UpdateAgent = z.infer<typeof UpdateAgent>;
export type AgentIdParam = z.infer<typeof AgentIdParam>;
export type AgentEntity = z.infer<typeof AgentEntity>;
export type AgentList = z.infer<typeof AgentList>;
