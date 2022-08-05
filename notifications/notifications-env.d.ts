type INotificationStatusNames = "created" | "delivered" | "read" | "deleted";

interface IMessage {
  request: string;
}

interface IMongoDB {
  client: import("mongodb").MongoClient;
  connection: import("mongodb").Db;
}

interface IWebSocketCacheItem {
  userId: number | null;
  jwt?: string;
}

type UserID = ?number;

interface IAuthVerifyResult {
  is_valid: boolean;
  user: {
    id: number;
  };
}
