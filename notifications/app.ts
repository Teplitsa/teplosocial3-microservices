import router from "./routes/notifications.js";
import express, { Express } from "express";
import bodyParser from "body-parser";

const app: Express = express();

app.disable("x-powered-by");

app.use(bodyParser.json());

app.use("/api/v1/", router);

export default app;
