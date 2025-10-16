import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import { CreateRole, RoleEntity, RoleList, UpdateRole } from "./roles.schema";

export const rolesService = {
  async create(data: CreateRole): Promise<RoleEntity> {
    const exists = await prisma.role.findFirst({
      where: {
        name: data.name,
      },
    });

    if (exists) {
      throw new AppError("BAD_REQUEST", 400, "Role already exists");
    }

    const role = await prisma.role.create({ data });

    return {
      id: role.id,
      name: role.name,
      permission: role.permission as string[],
    };
  },

  async find(pagination: PaginationQuery): Promise<RoleList> {
    const { search, limit, page } = pagination;

    const count = await prisma.role.count();

    const roles = await prisma.role.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { name: { contains: search } },
      select: {
        id: true,
        name: true,
        permission: true,
      },
    });

    return {
      items: roles.map((role) => ({
        ...role,
        permission: role.permission as string[],
      })),
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<RoleEntity> {
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        permission: true,
      },
    });

    if (!role) {
      throw new AppError("NOT_FOUND", 404, "Role not found");
    }

    return {
      ...role,
      permission: role.permission as string[],
    };
  },

  async update(id: string, data: UpdateRole): Promise<RoleEntity> {
    await this.findOne(id);

    const updatedRole = await prisma.role.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        permission: true,
      },
    });

    return {
      ...updatedRole,
      permission: updatedRole.permission as string[],
    };
  },

  async delete(id: string): Promise<RoleEntity> {
    const role = await this.findOne(id);
    const userIsStillExists = await prisma.user.findFirst({
      where: { roleId: id },
    });
    if (userIsStillExists) {
      throw new AppError("BAD_REQUEST", 400, "Role is still in use");
    }
    await prisma.role.delete({ where: { id } });
    return role;
  },
};
