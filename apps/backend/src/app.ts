import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { mapError } from "./common/errors";
import { usersRouter } from "./modules/users/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { authMiddleware, UserPayload } from "./middleware/auth.middleware";

export const app = new Hono<{ Variables: { user: UserPayload } }>();

app.use(prettyJSON());
app.use(cors());
app.use(authMiddleware);

app.route("/users", usersRouter);
app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError((err, c) => {
  const { status, body } = mapError(err);
  return c.json(body, status);
});
