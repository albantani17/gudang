import z from "zod";

export const LoginSchema = z.object({
  identifier: z
    .string("Email atau username tidak valid")
    .nonempty("Email atau username tidak boleh kosong"),
  password: z
    .string("Password tidak boleh kosong")
    .nonempty("Password tidak boleh kosong"),
});

export type LoginSchema = z.infer<typeof LoginSchema>;

export const useAuth = () => {
  const { $httpClient } = useNuxtApp();

  const login = async (payload: LoginSchema) => {
    const result = await $httpClient<{ data: string }>("/auth/login", {
      method: "POST",
      body: payload,
    });
    return result;
  };

  const me = async () => {
    const result = await $httpClient<{ data: string }>("/auth/me", {
      method: "GET",
    });
    return result;
  };

  return {
    login,
    me,
  };
};
