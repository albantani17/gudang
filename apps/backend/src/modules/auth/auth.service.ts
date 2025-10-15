import { ENV } from "../../common/environment";
import { AppError } from "../../common/errors";
import prisma from "../../lib/prisma";
import { sign } from "hono/jwt";

export const authService = {
  async login(identifier: string, password: string): Promise<string> {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", 404, "User not found");
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("UNAUTHORIZED", 401, "Invalid credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const token = await sign(payload, ENV().JWT_sECRET);
    return token;
  },
};
