import path from "path";
import { App } from "../../src/app";
import { Logger, LOGGER_LEVEL } from "../../src/logger";
import {
  JwTokenHelper,
  JwTokenHelperModule,
  jwtValidHandler,
} from "../../src/jwt";
import { JWT_TYPES } from "./infra/jwt";
import { controllers } from "./controller";
import { handlers } from "./application/handlers";

const app = App.createBuilder((opt) => {
  opt.allowAnonymousPath = [
    {
      path: "/auth/*",
      method: "^GET|POST$",
    },
  ];
});
app.useDotEnv(path.join(__dirname, ".env.test"));
app.useLogger(
  new Logger(
    app.env.get("NODE_ENV") === "dev" ? LOGGER_LEVEL.DEBUG : LOGGER_LEVEL.INFO,
  ),
);
app.useMediator(handlers);
app.loadModules(
  new JwTokenHelperModule(
    JWT_TYPES.ACCESSTOKEN,
    new JwTokenHelper({
      secret: app.env.get("JWT_SECRET"),
      options: {
        expiresIn: app.env.get("ACCESSTOKEN_EXPIRES_IN"),
      },
    }),
  ),
  new JwTokenHelperModule(
    JWT_TYPES.REFRESHTOKEN,
    new JwTokenHelper({
      secret: app.env.get("JWT_SECRET"),
      options: {
        expiresIn: app.env.get("REFRESHTOKEN_EXPIRES_IN"),
      },
    }),
  ),
);
app.useCors({
  origin: app.env.get("CORS_ORIGIN"),
  methods: "GET,PUT,PATCH,POST,DELETE",
  credentials: true,
});
app.useJsonParser();
app.useUrlEncodedParser({ extended: true });
app.useAuthGate(jwtValidHandler(app.env.get("JWT_SECRET")));
app.useTimerMiddleware((duration, ts, req, res) => {
  let msg = `Request: ${res.statusCode} ${req.method} ${req.originalUrl} - Duration: ${duration.toFixed(2)} ms`;
  const tsMsg = ts.map((span) => {
    const prefix = " ".repeat((span.depth ? span.depth * 3 : 0) + 28);
    return `\n${prefix}⎣__TimeSpan: ${span.duration?.toFixed(2) ?? "N/A"} ms - ${span.label}`;
  });
  msg += tsMsg.join("");
  if (duration > 1000) {
    app.logger.warn(msg);
  } else {
    app.logger.debug(msg);
  }
});
app.mapController(controllers);
app.run(app.env.get("PORT"));
