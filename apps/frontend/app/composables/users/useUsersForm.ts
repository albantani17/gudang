import z from "zod";
import type { TUSer } from "~/types/user";
import { FetchError } from "ofetch";
import { useRoles } from "../roles/useRoles";

const CreateUserSchema = z.object({
  name: z.string("nama tidak boleh kosong").nonempty("nama tidak boleh kosong"),
  email: z
    .email("email tidak boleh kosong")
    .nonempty("email tidak boleh kosong")
    .toLowerCase(),
  username: z
    .string("username tidak boleh kosong")
    .nonempty("username tidak boleh kosong")
    .toLowerCase(),
  roleId: z
    .object({
      label: z
        .string("role tidak boleh kosong")
        .min(1, "role tidak boleh kosong"),
      value: z
        .string("role tidak boleh kosong")
        .min(1, "role tidak boleh kosong"),
    })
    .refine((val) => val.value !== "", "role tidak boleh kosong"),
  password: z
    .string("password tidak boleh kosong")
    .nonempty("password tidak boleh kosong"),
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;

interface UserFormOptions {
  onSuccess?: () => void;
}

export const useUsersForm = (opts?: UserFormOptions) => {
  const { $httpClient } = useNuxtApp();
  const { find } = useRoles();
  const toast = useToast();
  const loading = ref(false);
  let error = ref(null);
  const rolesItem = ref<{ label: string; value: string }[]>([]);
  const searchRole = ref("");
  const loadingRoles = ref(false);

  const loadRoles = async () => {
    loadingRoles.value = true;
    try {
      const res = await find({ limit: 10, page: 1, search: searchRole.value });
      console.log(res);
      const roles = res.data.items.map((role) => ({
        label: role.name,
        value: role.id,
      }));
      rolesItem.value = roles;
    } finally {
      loadingRoles.value = false;
    }
  };

  const stateForm = reactive({
    name: "",
    email: "".toLowerCase(),
    username: "".toLowerCase(),
    roleId: {
      label: "",
      value: "",
    },
    password: "",
  });

  const create = async () => {
    try {
      loading.value = true;
      const result = await $httpClient<{ data: TUSer }>("/users", {
        method: "POST",
        body: { ...stateForm, roleId: stateForm.roleId.value },
      });
      toast.add({
        title: "Success",
        description: "User berhasil ditambahkan",
        icon: "i-lucide-check",
        color: "success",
      });
      opts?.onSuccess?.();
      loading.value = false;
      return result;
    } catch (err) {
      loading.value = false;
      if (err instanceof FetchError) {
        toast.add({
          title: "Error",
          description: err.data.message || err.message,
          icon: "i-lucide-x",
          color: "error",
        });
        error.value = err.data.message || err.message;
      }
      toast.add({
        title: "Error",
        description: "Terjadi kesalahan",
        icon: "i-lucide-x",
        color: "error",
      });
      return;
    }
  };

  watchDebounced(
    searchRole,
    () => {
      loadRoles();
    },
    { debounce: 1000 },
  );

  loadRoles();

  return {
    stateForm,
    schema: CreateUserSchema,
    create,
    error,
    loading,
    searchRole,
    loadRoles,
    loadingRoles,
    rolesItem,
  };
};
