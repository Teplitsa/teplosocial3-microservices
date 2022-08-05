import { MongoClient } from "mongodb";
import { loadEnvVars } from "../utilities.js";

loadEnvVars();

const { MONGO_CLIENT_URL, MONGO_DB_NAME } = process.env;

class MongoDB {
  private static instance: IMongoDB | null = null;

  public static async getInstance(): Promise<IMongoDB> {
    if (Object.is(MongoDB.instance, null)) {
      try {
        const client = new MongoClient(MONGO_CLIENT_URL as string, {
          minPoolSize: 100,
          maxPoolSize: 1000,
        });

        await client.connect();

        client.on("serverClosed", () => {
          MongoDB.instance = null;
        });

        MongoDB.instance = {
          client,
          connection: client.db(MONGO_DB_NAME),
        };
      } catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
      }
    }

    return MongoDB.instance as IMongoDB;
  }
}

export default MongoDB;
