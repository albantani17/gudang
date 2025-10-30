import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  AgentEntity,
  AgentList,
  CreateAgent,
  UpdateAgent,
} from "./agents.schema";

export const agentsServices = {
  async create(data: CreateAgent): Promise<AgentEntity> {
    const exists = await prisma.agent.findFirst({
      where: {
        code: data.code,
      },
    });

    if (exists) {
      throw new AppError("BAD_REQUEST", 400, "Agent already exists");
    }

    const agent = await prisma.agent.create({ data });

    return agent;
  },

  async find(pagination: PaginationQuery): Promise<AgentList> {
    const { search, limit, page } = pagination;

    const where = search ? { name: { contains: search } } : undefined;

    const count = await prisma.agent.count({ where });

    const agents = await prisma.agent.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
    });

    return {
      items: agents,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<AgentEntity> {
    const agent = await prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      throw new AppError("NOT_FOUND", 404, "Agent not found");
    }

    return agent;
  },

  async update(id: string, data: UpdateAgent): Promise<AgentEntity> {
    await this.findOne(id);
    const agent = await prisma.agent.update({ where: { id }, data });

    return agent;
  },

  async delete(id: string): Promise<AgentEntity> {
    const agent = await this.findOne(id);
    await prisma.agent.delete({ where: { id } });
    return agent;
  },
};
