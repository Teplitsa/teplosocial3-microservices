import { config } from "dotenv";
import { resolve } from "path";

export function loadEnvVars() {
  config({
    path: resolve(
      process.cwd(),
      ((envirement) => {
        let configFileName: string;

        switch (envirement) {
          case "production":
            configFileName = "prod.env";
            break;
          case "pre-production":
            configFileName = "pre-prod.env";
            break;
          default:
            configFileName = "dev.env";
            break;
        }

        return configFileName;
      })(process.env.NODE_ENV)
    ),
    override: true,
  });
}
