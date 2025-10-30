<script setup lang="ts">
import type { LoginSchema } from "#imports";
import type { AuthFormField, FormSubmitEvent } from "#ui/types";
import { FetchError } from "ofetch";

definePageMeta({
  layout: "auth",
});

const toast = useToast();
const { login } = useAuth();
const loading = ref(false);

const fields: AuthFormField[] = [
  {
    name: "identifier",
    type: "text",
    label: "Email atau username",
    placeholder: "axF1t@example.com / username",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "••••••••",
    required: true,
  },
];

const onSubmit = async (payload: FormSubmitEvent<LoginSchema>) => {
  const cookie = useCookie("auth_token", {
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  loading.value = true;
  try {
    const { data } = await login(payload.data);
    cookie.value = data;
    toast.add({
      title: "Success",
      description: "Login berhasil",
      icon: "i-lucide-check",
      color: "success",
    });
    loading.value = false;
    navigateTo("/");
  } catch (error) {
    if (error instanceof FetchError) {
      toast.add({
        title: "Error",
        description: error.data.message || error.message,
        icon: "i-lucide-x",
        color: "error",
      });
      loading.value = false;
      return;
    }
    toast.add({
      title: "Error",
      description: "Login gagal",
      icon: "i-lucide-x",
      color: "error",
    });
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="LoginSchema"
        title="Login"
        :fields="fields"
        icon="i-lucide-warehouse"
        :loading="loading"
        description="Login untuk masuk ke sistem gudang"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
