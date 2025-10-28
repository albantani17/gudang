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
import { assetAreasRouter } from "./modules/asset-areas/asset-areas.route";
import { agentsRouter } from "./modules/agents/agents.route";
import { purchaseOrdersRouter } from "./modules/purchase-order/purchase-order.route";
import { wareHousesRouter } from "./modules/warehouses/warehouses.route";
import { transactionInRoute } from "./modules/transactions-in/transactions-in.route";
import { transactionOutRoute } from "./modules/transactions-out/transactions-out.route";

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
app.route("/api/asset-areas", assetAreasRouter);
app.route("/api/agents", agentsRouter);
app.route("/api/purchase-orders", purchaseOrdersRouter);
app.route("/api/warehouses", wareHousesRouter);
app.route("/api/transactions-in", transactionInRoute);
app.route("/api/transactions-out", transactionOutRoute);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError((err, c) => {
  const { status, body } = mapError(err);
  return c.json(body, status);
});
