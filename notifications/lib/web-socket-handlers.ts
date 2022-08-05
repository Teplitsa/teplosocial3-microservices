import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { ChangeStream } from "mongodb";
import MongoDB from "../models/mongodb.js";
import Auth from "../models/auth.js";
import { ChangeStreamDocument, Document } from "mongodb";

function onCloseCreator(changeStream: ChangeStream<Document>) {
  return async function onClose(event: CloseEvent) {
    await changeStream.close();
  };
}

export async function onConnection(
  this: WebSocketServer,
  ws: WebSocket,
  message: IncomingMessage
): Promise<void> {
  const auth = new Auth(message);

  if (!auth.jwt) {
    return;
  }

  const userId = await auth.verifyAndGetUserID();

  if (!userId) {
    return;
  }

  const { connection } = await MongoDB.getInstance();

  try {
    const collection = connection.collection("notification_list");

    ws.send(
      JSON.stringify({
        operation: "get",
        target: await collection
          .find({ userId })
          .sort({ timestamp: -1 })
          .toArray(),
      })
    );

    const changeStream = collection.watch(
      [
        {
          $match: {
            operationType: {
              $in: ["insert", "update"],
            },
            "fullDocument.userId": userId,
          },
        },
      ],
      {
        fullDocument: "updateLookup",
      }
    );

    changeStream.on("change", async (event: ChangeStreamDocument<Document>) => {
      if (!(await auth.verifyAndGetUserID())) ws.close();

      const { operationType, documentKey, fullDocument, updateDescription } =
        event;

      ws.send(
        JSON.stringify({
          operation: operationType.toLowerCase(),
          target: updateDescription?.updatedFields
            ? { ...documentKey, ...updateDescription.updatedFields }
            : fullDocument,
        })
      );
    });

    ws.addEventListener("close", onCloseCreator(changeStream));
  } catch (error) {
    console.log(
      `An error occured during getting the notification list: ${error}`
    );
  }

  // ws.addEventListener("message", onMessage);
}

// function onMessage(this: WebSocket, event: MessageEvent<string>): void {
//   const message: IMessage = JSON.parse(event.data);
// }
