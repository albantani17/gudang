import { AppError } from "./errors";

type RuntimeEnv = {
  JWT_sECRET: string;
};

type AdminSeedEnv = {
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_USERNAME: string;
};

let runtimeEnv: RuntimeEnv | null = null;
let adminSeedEnv: AdminSeedEnv | null = null;

function ensureRuntimeEnv(): RuntimeEnv {
  const JWT_sECRET = process.env.JWT_SECRET;
  if (!JWT_sECRET) {
    throw new AppError("INTERNAL", 500, "JWT_SECRET is not defined");
  }
  return { JWT_sECRET };
}

function ensureAdminSeedEnv(): AdminSeedEnv {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

  const missing = [
    ADMIN_EMAIL ? null : "ADMIN_EMAIL",
    ADMIN_PASSWORD ? null : "ADMIN_PASSWORD",
    ADMIN_USERNAME ? null : "ADMIN_USERNAME",
  ].filter((value): value is string => Boolean(value));

  if (missing.length) {
    throw new AppError(
      "INTERNAL",
      500,
      `Missing environment variables: ${missing.join(", ")}`
    );
  }

  return {
    ADMIN_EMAIL: ADMIN_EMAIL!,
    ADMIN_PASSWORD: ADMIN_PASSWORD!,
    ADMIN_USERNAME: ADMIN_USERNAME!,
  };
}

export const ENV = () => {
  if (!runtimeEnv) {
    runtimeEnv = ensureRuntimeEnv();
  }
  return runtimeEnv;
};

export const ENV_ADMIN_SEED = () => {
  if (!adminSeedEnv) {
    adminSeedEnv = ensureAdminSeedEnv();
  }
  return adminSeedEnv;
};

export const validateEnvironment = () => {
  const runtime = ENV();
  const admin = ENV_ADMIN_SEED();
  return { runtime, admin };
};
