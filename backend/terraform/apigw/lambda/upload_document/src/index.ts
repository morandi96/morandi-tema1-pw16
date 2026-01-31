import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Content-Type": "application/json",
};

interface ReservationDocument {
  fileName: string;
  fileBase64: string;
  uploadedAt: string;
}

interface DocumentRequest {
  action: "upload" | "delete";
  document?: ReservationDocument; // Optional per delete
  documentType: "user" | "doctor";
}

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

    // Estrai l'ID prenotazione dai parametri del path
    const reservationId = event.pathParameters?.id;

    if (!reservationId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "ID prenotazione mancante",
          code: "MISSING_RESERVATION_ID",
        }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Body mancante",
          code: "MISSING_BODY",
        }),
      };
    }

    let requestBody: DocumentRequest;
    try {
      requestBody = JSON.parse(event.body);
      console.log("Parsed request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid JSON in request body",
          code: "INVALID_JSON",
        }),
      };
    }

    const { action, document, documentType } = requestBody;

    if (!action || !documentType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Azione o tipo documento mancante",
          code: "MISSING_REQUIRED_DATA",
        }),
      };
    }

    if (action !== "upload" && action !== "delete") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Azione non valida. Usare "upload" o "delete"',
          code: "INVALID_ACTION",
        }),
      };
    }

    if (action === "upload" && !document) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Documento mancante per upload",
          code: "MISSING_DOCUMENT_FOR_UPLOAD",
        }),
      };
    }

    if (documentType !== "user" && documentType !== "doctor") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Tipo documento non valido. Usare "user" o "doctor"',
          code: "INVALID_DOCUMENT_TYPE",
        }),
      };
    }

    console.log(
      `${action} documento per prenotazione:`,
      reservationId,
      "tipo:",
      documentType,
    );

    // Verifica che la prenotazione esista e appartenga all'utente
    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `RESERVATION#${reservationId}`,
        },
      }),
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Prenotazione non trovata",
          code: "RESERVATION_NOT_FOUND",
        }),
      };
    }

    // Determina quale attributo aggiornare in base al tipo di documento
    const attributeName =
      documentType === "user" ? "userDocument" : "doctorDocument";

    let updateResult;
    let actionMessage;

    if (action === "upload") {
      // Caricamento del documento
      updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `RESERVATION#${reservationId}`,
          },
          UpdateExpression: `SET ${attributeName} = :document`,
          ExpressionAttributeValues: {
            ":document": document,
          },
          ReturnValues: "ALL_NEW",
        }),
      );
      actionMessage = "Documento caricato con successo";
    } else {
      // Cancellazione del documento - rimuove l'attributo
      updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `RESERVATION#${reservationId}`,
          },
          UpdateExpression: `REMOVE ${attributeName}`,
          ReturnValues: "ALL_NEW",
        }),
      );
      actionMessage = "Documento eliminato con successo";
    }

    console.log(
      `${action} completato con successo:`,
      reservationId,
      attributeName,
    );

    // Formatta la risposta con i dati della prenotazione aggiornata
    const updatedReservation = updateResult.Attributes;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: actionMessage,
        reservation: {
          id: updatedReservation?.id,
          date: updatedReservation?.date,
          time: updatedReservation?.time,
          category: updatedReservation?.category,
          doctor: updatedReservation?.doctor,
          status: updatedReservation?.status,
          location: updatedReservation?.location,
          userDocument: updatedReservation?.userDocument,
          doctorDocument: updatedReservation?.doctorDocument,
        },
      }),
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
