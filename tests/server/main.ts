import path from "path";
import { App } from "../../src/app";
import { Logger, LOGGER_LEVEL } from "../../src/logger";
import { controllers, wsControllers } from "./controller";
import { handlers } from "./application/handlers";
import { ScopeTest, ScopeTestSymbol } from "./domain/user/user.root";
import { JwtModule } from "./infra/jwt";
import { jwtGuard } from "../../src";
import { timerMiddleware } from "../../src/utils/timer";

const app = App.createBuilder();
app.setDotEnv(path.join(__dirname, ".env.test"));
app.setLogger(
  new Logger(
    app.env.get("NODE_ENV") === "dev" ? LOGGER_LEVEL.DEBUG : LOGGER_LEVEL.INFO,
  ),
);
app.enableAuthGuard(jwtGuard(app.env.get("JWT_SECRET")));
app.setMediator(handlers);
app.addRequestScope(ScopeTestSymbol, ScopeTest);
app.loadModules(
  new JwtModule(
    {
      secret: app.env.get("JWT_SECRET"),
      options: {
        expiresIn: parseInt(app.env.get("ACCESSTOKEN_EXPIRES_IN")),
      },
    },
    {
      secret: app.env.get("JWT_SECRET"),
      options: {
        expiresIn: parseInt(app.env.get("REFRESHTOKEN_EXPIRES_IN")),
      },
    },
  ),
);
app.useCors({
  origin: app.env.get("CORS_ORIGIN"),
  methods: "GET,PUT,PATCH,POST,DELETE",
  credentials: true,
});
app.useJsonParser();
app.useUrlEncodedParser({ extended: true });
app.useMiddleware(timerMiddleware(app.logger))
app.mapController(controllers);
app.enableWebSocket(wsControllers);
app.run(parseInt(app.env.get("PORT")));
