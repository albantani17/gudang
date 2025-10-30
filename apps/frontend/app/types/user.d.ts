export type TUSer = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: TRole;
  createdAt: string;
  updatedAt: string;
};

export type TRole = {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};
