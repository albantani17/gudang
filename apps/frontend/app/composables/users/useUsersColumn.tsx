import type {
  AvatarProps,
  DropdownMenuItem,
  DropdownMenuProps,
  TableColumn,
} from "#ui/types";
import type { TUSer } from "~/types/user";

export const useUsersColum = () => {
  const UAvatar = resolveComponent("UAvatar");
  const UDropdownMenu = resolveComponent("UDropdownMenu");
  const UButton = resolveComponent("UButton");

  const columns: TableColumn<TUSer>[] = [
    {
      accessorKey: "no",
      header: "No",
      cell: (info) => info.row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => {
        return h("div", { class: "flex items-center gap-2" }, [
          h<AvatarProps>(UAvatar, {
            src: info.row.original.name,
            alt: info.row.original.name,
          }),
          h("p", undefined, info.row.original.name),
        ]);
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => info.row.original.role.name,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return h(
          "div",
          { class: "text-right" },
          h<DropdownMenuProps>(
            UDropdownMenu,
            {
              content: {
                align: "end",
              },
              items: [
                {
                  label: "edit",
                  icon: "i-lucide-notebook-pen",
                  color: "primary",
                  onSelect: () => {
                    console.log(row.original);
                  },
                },
                {
                  label: "Ubah Password",
                  icon: "i-lucide-key-round",
                  color: "warning",
                  onSelect: () => {
                    console.log(row.original);
                  },
                },
                {
                  label: "Hapus",
                  icon: "i-lucide-trash",
                  color: "error",
                  onSelect: () => {
                    console.log(row.original);
                  },
                },
              ],
            },
            () =>
              h(UButton, {
                icon: "i-lucide-ellipsis-vertical",
                color: "neutral",
                variant: "ghost",
                class: "ml-auto",
              }),
          ),
        );
      },
    },
  ];

  return { columns };
};
