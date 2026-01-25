import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: "active" | "cancelled" | "completed";
  location: string | null;
  createdAt: string;
  userDocument: string;
  doctorDocument: string;
}

interface DynamoDBItem {
  PK: string;
  SK: string;
  id: string;
  userId: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: "active" | "cancelled" | "completed";
  location?: string | null;
  createdAt: string;
  userDocument: string;
  doctorDocument: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Estrai l'ID utente Cognito dal token (sub claim)
    const authenticatedUserId = event.requestContext?.authorizer?.claims
      ?.sub as string | undefined;

    if (!authenticatedUserId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Utente non autenticato",
          code: "UNAUTHORIZED",
        }),
      };
    }

    // Parametri query string
    const queryParams = event.queryStringParameters || {};

    // Se userId viene passato, usalo (altrimenti usa l'utente autenticato)
    const targetUserId = queryParams.userId || authenticatedUserId;
    const statusFilter = queryParams.status;
    const dateFilter = queryParams.date;

    console.log("Query params:", { targetUserId, statusFilter, dateFilter });

    // Query per PK (userId)
    const queryCommand: QueryCommandInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${targetUserId}`,
        ":sk": "RESERVATION#",
      },
    };

    // Aggiungi filtri opzionali
    const filterExpressions: string[] = [];

    if (statusFilter) {
      filterExpressions.push("#status = :status");
      queryCommand.ExpressionAttributeValues![":status"] = statusFilter;
      queryCommand.ExpressionAttributeNames =
        queryCommand.ExpressionAttributeNames || {};
      queryCommand.ExpressionAttributeNames["#status"] = "status";
    }

    if (dateFilter) {
      filterExpressions.push("#date = :date");
      queryCommand.ExpressionAttributeValues![":date"] = dateFilter;
      queryCommand.ExpressionAttributeNames =
        queryCommand.ExpressionAttributeNames || {};
      queryCommand.ExpressionAttributeNames["#date"] = "date";
    }

    if (filterExpressions.length > 0) {
      queryCommand.FilterExpression = filterExpressions.join(" AND ");
    }

    console.log("DynamoDB Query:", JSON.stringify(queryCommand, null, 2));

    const result = await docClient.send(new QueryCommand(queryCommand));

    console.log(`Trovate ${result.Items?.length || 0} prenotazioni`);

    // Mappa i risultati nel formato atteso dal frontend
    const reservations: Reservation[] = (
      (result.Items || []) as DynamoDBItem[]
    ).map((item) => ({
      id: item.id,
      userId: item.userId,
      date: item.date,
      time: item.time,
      category: item.category,
      doctor: item.doctor,
      status: item.status,
      location: item.location || null,
      createdAt: item.createdAt,
      userDocument: item.userDocument,
      doctorDocument: item.doctorDocument,
    }));

    // Ordina per data (più recenti prima)
    reservations.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(reservations),
    };
  } catch (error) {
    console.error("Errore:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Errore interno del server",
        code: "INTERNAL_ERROR",
      }),
    };
  }
};
