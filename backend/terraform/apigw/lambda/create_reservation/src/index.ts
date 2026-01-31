import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import { CreateReservationRequest, Reservation } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", JSON.stringify(event, null, 2));

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const userId = event.requestContext?.authorizer?.claims?.sub as
      | string
      | undefined;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Utente non autenticato",
          code: "UNAUTHORIZED",
        }),
      };
    }

    const body: CreateReservationRequest = JSON.parse(event.body || "{}");
    const { date, time, category, doctor, location, status, notes } = body;

    // Validazione campi obbligatori
    if (!date || !time || !category || !doctor) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Campi obbligatori mancanti: date, time, category, doctor",
          code: "VALIDATION_ERROR",
        }),
      };
    }

    // Genera ID univoco per la prenotazione
    const reservationId = randomUUID();
    const createdAt = new Date().toISOString();

    // Crea l'item per DynamoDB
    const item = {
      PK: `USER#${userId}`,
      SK: `RESERVATION#${reservationId}`,
      id: reservationId,
      userId: userId,
      date: date,
      time: time,
      category: category,
      doctor: doctor,
      status: status,
      location: location || null,
      notes: notes || null,
      createdAt: createdAt,
    };

    // Salva in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    console.log("Prenotazione creata:", reservationId);

    // Ritorna la prenotazione creata
    const response: Reservation = {
      id: reservationId,
      userId: userId,
      date: date,
      time: time,
      category: category,
      doctor: doctor,
      status: "In attesa di conferma",
      location: location || null,
      notes: notes || null,
      createdAt: createdAt,
    };

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(response),
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
