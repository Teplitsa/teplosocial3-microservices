import { IncomingMessage, IncomingHttpHeaders } from "http";
import fetch from "node-fetch";
import { loadEnvVars } from "../utilities.js";

loadEnvVars();

class Auth {
  private token?: string;

  constructor(message: IncomingMessage) {
    const { headers, url } = message;

    this.parseHeaders(headers);
    this.parseURL(url);

    if (typeof this.token === "undefined") {
      console.error("The token must be provided.");
    }
  }

  private parseHeaders(headers: IncomingHttpHeaders) {
    if (typeof headers["x-auth-token"] === "string") {
      this.token = headers["x-auth-token"];
    }
  }

  private parseURL(url?: string) {
    if (typeof url === "string") {
      try {
        const [, params] = url.match(/\?([^?]+)$/i) as Array<
          string | undefined
        >;

        const searchParams = new URLSearchParams(params);
        const token = searchParams.get("auth_token");

        if (token) {
          this.token = token;
        }
      } catch (error) {
        console.error(`Bad URL: ${error}`);
      }
    }
  }

  public async verifyAndGetUserID(): Promise<UserID> {
    try {
      const requestUrl = new URL(
        `${process.env.RESTFUL_SERVICE_URL}/auth/validate-token`
      );

      const response = await fetch(requestUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          short_response: true,
        }),
      });

      const result = (await response.json()) as IAuthVerifyResult;

      if (result.is_valid) {
        const { id } = result.user;

        return id;
      }
    } catch (error) {
      console.error(`Authorization failed: ${error}`);
    }

    return null;
  }

  get jwt() {
    return this.token;
  }
}

export default Auth;
