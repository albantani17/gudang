import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateUserBody,
  UpdateUserBody,
  UserEntity,
  UserList,
} from "./users.schema";

export const usersService = {
  async create(data: CreateUserBody): Promise<UserEntity> {
    const findUserExists = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (findUserExists) {
      throw new AppError("BAD_REQUEST", 400, "User already exists");
    }

    data.password = await Bun.password.hash(data.password);

    const createUser = await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createUser;
  },

  async findAll(pagination: PaginationQuery): Promise<UserList> {
    const { search, limit, page } = pagination;
    const orSearch =
      search && search.trim().length > 0
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ]
        : undefined;

    const count = await prisma.user.count({
      where: { OR: orSearch },
    });

    const users = await prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { OR: orSearch },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      items: users,
      total: count,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<UserEntity> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", 404, "User not found");
    }

    return user;
  },

  async update(id: string, data: UpdateUserBody): Promise<UserEntity> {
    await this.findOne(id);
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async delete(id: string): Promise<UserEntity> {
    await this.findOne(id);
    const user = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },
};
