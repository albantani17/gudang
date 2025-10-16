import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { mapError } from "./common/errors";
import { usersRouter } from "./modules/users/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { authMiddleware, UserPayload } from "./middleware/auth.middleware";
import { rbacMiddleware } from "./middleware/rbac.middleware";
import { rolesRouter } from "./modules/roles/role.route";
import { unitsRouter } from "./modules/units/units.route";
import { categoriesRouter } from "./modules/categories/categories.route";
import { productsRouter } from "./modules/products/products.route";
import { suppliersRouter } from "./modules/suppliers/suppliers.route";

export const app = new Hono<{ Variables: { user: UserPayload } }>();

app.use(prettyJSON());
app.use(cors());
app.use(authMiddleware, rbacMiddleware);

app.route("/api/users", usersRouter);
app.route("/api/auth", authRouter);
app.route("/api/roles", rolesRouter);
app.route("/api/units", unitsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/products", productsRouter);
app.route("/api/suppliers", suppliersRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError((err, c) => {
  const { status, body } = mapError(err);
  return c.json(body, status);
});
