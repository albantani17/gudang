<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "#ui/types";
import z from "zod";

definePageMeta({
  layout: "auth",
});

const toast = useToast();

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

const schema = z.object({
  identifier: z
    .string("Email atau username tidak boleh kosong")
    .min(1, "Email atau username tidak boleh kosong"),
  password: z
    .string("Password tidak boleh kosong")
    .min(1, "Password tidak boleh kosong"),
});

type LoginSchema = z.infer<typeof schema>;

const onSubmit = (payload: FormSubmitEvent<LoginSchema>) => {
  console.log(payload);

  toast.add({
    title: "Success",
    description: "Login berhasil",
    icon: "i-lucide-check",
    color: "success",
  });
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        :fields="fields"
        icon="i-lucide-warehouse"
        description="Login untuk masuk ke sistem gudang"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
