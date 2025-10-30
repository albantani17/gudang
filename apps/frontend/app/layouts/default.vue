<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const toast = useToast();

const open = ref(false);
const color = useColorMode();

const links = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-house",
      to: "/",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "User Management",
      icon: "i-lucide-users",
      type: "trigger",
      children: [
        {
          label: "User",
          to: "/users",
          description: "User management",
          icon: "i-lucide-users",
        },
        {
          label: "Role",
          to: "/roles",
          icon: "i-lucide-shield-user",
        },
      ],
    },
    {
      label: "Master",
      icon: "i-lucide-album",
      type: "trigger",
      children: [
        {
          label: "Barang",
          to: "/products",
          description: "Master barang",
          icon: "i-lucide-package-2",
        },
        {
          label: "Satuan",
          to: "/units",
          description: "Master satuan",
          icon: "i-lucide-ruler",
        },
        {
          label: "Supplier",
          to: "/suppliers",
          description: "Master supplier",
          icon: "i-lucide-truck",
        },
        {
          label: "Kategori",
          to: "/categories",
          description: "Master kategori",
          icon: "i-lucide-tag",
        },
        {
          label: "Gudang",
          to: "/warehouses",
          description: "Master gudang",
          icon: "i-lucide-warehouse",
        },
        {
          label: "Asset Area",
          to: "/asset-areas",
          description: "Master asset area",
          icon: "i-lucide-map",
        },
        {
          label: "Agen",
          to: "/agents",
          description: "Master agen",
          icon: "i-lucide-hat-glasses",
        },
      ],
    },
    {
      label: "Pembelian",
      icon: "i-lucide-shopping-cart",
      type: "trigger",
      defaultOpen: true,
      children: [
        {
          label: "Pembelian Order(PO)",
          to: "/purchases",
          description: "Pembelian barang",
          icon: "i-lucide-notebook-pen",
        },
        {
          label: "Laporan PO",
          to: "/purchase-reports",
          description: "Laporan pembelian barang",
          icon: "i-lucide-notebook",
        },
      ],
    },
    {
      label: "Asset",
      type: "trigger",
      icon: "i-lucide-package-search",
      defaultOpen: true,
      children: [
        {
          label: "List Asset",
          to: "/assets",
          description: "Asset barang",
          icon: "i-lucide-package-2",
        },
        {
          label: "Asset Non aktif",
          to: "/asset-reports",
          description: "Laporan asset barang",
          icon: "i-lucide-package-x",
        },
      ],
    },
    {
      label: "Aplikasi",
      type: "trigger",
      icon: "i-lucide-settings",
      children: [
        {
          label: "Konfigurasi",
          to: "/configs",
          description: "Pengaturan aplikasi",
          icon: "i-lucide-cog",
        },
        {
          label: "Log Aplikasi",
          to: "/logs",
          description: "Log aplikasi",
          icon: "i-lucide-logs",
        },
      ],
    },
  ],
  [
    {
      label: color.value === "dark" ? "Light Mode" : "Dark Mode",
      icon: color.value === "dark" ? "i-lucide-sun" : "i-lucide-moon",
      onClick: () => {
        color.value = color.value === "dark" ? "light" : "dark";
      },
    },
    {
      label: "Ada Masalah? WA ALBAN",
      icon: "i-lucide-message-circle",
    },
  ],
]);

const groups = computed(() => [
  {
    id: "links",
    label: "Go to",
    items: links.value.flat(),
  },
]);

onMounted(async () => {
  const cookie = useCookie("cookie-consent");
  if (cookie.value === "accepted") {
    return;
  }

  toast.add({
    title:
      "We use first-party cookies to enhance your experience on our website.",
    duration: 0,
    close: false,
    actions: [
      {
        label: "Accept",
        color: "neutral",
        variant: "outline",
        onClick: () => {
          cookie.value = "accepted";
        },
      },
      {
        label: "Opt out",
        color: "neutral",
        variant: "ghost",
      },
    ],
  });
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <UDashboardLogo :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
