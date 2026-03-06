const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const email = body.email || "anonymous";

    // Log raw event
    await client.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          id: { S: id },
          ts: { S: now },
          event: { S: body.event || "unknown" },
          user: { S: body.user || "anonymous" },
          email: { S: email },
          mode: { S: body.mode || "" },
          provider: { S: body.provider || "" },
          model: { S: body.model || "" },
          data: { S: JSON.stringify(body.data || {}) },
        },
      }),
    );

    // Upsert user record with first_seen, last_seen, event_count
    await client.send(
      new UpdateItemCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { email: { S: email } },
        UpdateExpression:
          "SET #u = :u, #m = :m, last_seen = :ts, " +
          "first_seen = if_not_exists(first_seen, :ts) " +
          "ADD event_count :one",
        ExpressionAttributeNames: { "#u": "user", "#m": "mode" },
        ExpressionAttributeValues: {
          ":u": { S: body.user || "anonymous" },
          ":m": { S: body.mode || "" },
          ":ts": { S: now },
          ":one": { N: "1" },
        },
      }),
    );

    return { statusCode: 200, headers: CORS, body: "ok" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: CORS, body: "error" };
  }
};
