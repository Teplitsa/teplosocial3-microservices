import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import cors, { CorsOptions } from "cors";
import { ObjectId } from "mongodb";
import MongoDB from "../models/mongodb.js";
import { loadEnvVars } from "../utilities.js";

loadEnvVars();

const corsOptions: CorsOptions = {
  origin: process.env.MAIN_APP_URL,
  methods: ["OPTIONS", "POST", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "X-Auth-Token"],
};

const router = Router();

router.use(cors(corsOptions));

router.put(
  "/notifications/:_id",
  async (
    req: Request<{ _id: string }, { status: INotificationStatusNames }>,
    res: Response
  ) => {
    const { client: mongoClient, connection } = await MongoDB.getInstance();

    try {
      if (
        !req.headers["x-auth-token"] ||
        !req.body.status ||
        !req.body.userId
      ) {
        res.status(400).end();

        return;
      }

      const collection = connection.collection("notification_list");

      const notification = await collection.findOne<{ externalId: number }>(
        {
          _id: new ObjectId(req.params._id),
        },
        { projection: { _id: false, externalId: true } }
      );

      const requestUrl = new URL(
        `${process.env.RESTFUL_SERVICE_URL}/notifications/${notification?.externalId}`
      );

      const response = await fetch(requestUrl.toString(), {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.headers["x-auth-token"]}`,
        },
        body: JSON.stringify({
          status: req.body.status,
          userId: req.body.userId,
        }),
      });

      res.status(response.status).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }
);

export default router;
