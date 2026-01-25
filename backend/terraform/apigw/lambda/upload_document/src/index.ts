import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Content-Type': 'application/json'
};

interface ReservationDocument {
  fileName: string;
  fileBase64: string;
  uploadedAt: string;
}

interface UploadDocumentRequest {
  document: ReservationDocument;
  documentType: 'user' | 'doctor';
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Estrai l'ID utente Cognito dal token (sub claim)
    const userId = event.requestContext?.authorizer?.claims?.sub as string | undefined;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Utente non autenticato', code: 'UNAUTHORIZED' })
      };
    }

    // Estrai l'ID prenotazione dai parametri del path
    const reservationId = event.pathParameters?.id;

    if (!reservationId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'ID prenotazione mancante',
          code: 'MISSING_RESERVATION_ID'
        })
      };
    }

    // Parse del body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Body mancante',
          code: 'MISSING_BODY'
        })
      };
    }

    const requestBody: UploadDocumentRequest = JSON.parse(event.body);
    const { document, documentType } = requestBody;

    if (!document || !documentType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Documento o tipo documento mancante',
          code: 'MISSING_DOCUMENT_DATA'
        })
      };
    }

    if (documentType !== 'user' && documentType !== 'doctor') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Tipo documento non valido. Usare "user" o "doctor"',
          code: 'INVALID_DOCUMENT_TYPE'
        })
      };
    }

    console.log('Caricando documento per prenotazione:', reservationId, 'tipo:', documentType);

    // Verifica che la prenotazione esista e appartenga all'utente
    const getResult = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `RESERVATION#${reservationId}`
      }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Prenotazione non trovata',
          code: 'RESERVATION_NOT_FOUND'
        })
      };
    }

    // Determina quale attributo aggiornare in base al tipo di documento
    const attributeName = documentType === 'user' ? 'userDocument' : 'doctorDocument';

    // Aggiorna il documento sulla prenotazione
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `RESERVATION#${reservationId}`
      },
      UpdateExpression: `SET ${attributeName} = :document`,
      ExpressionAttributeValues: {
        ':document': document
      },
      ReturnValues: 'ALL_NEW'
    }));

    console.log('Documento caricato con successo:', reservationId, attributeName);

    // Formatta la risposta con i dati della prenotazione aggiornata
    const updatedReservation = updateResult.Attributes;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Documento caricato con successo',
        reservation: {
          id: updatedReservation?.id,
          date: updatedReservation?.date,
          time: updatedReservation?.time,
          category: updatedReservation?.category,
          doctor: updatedReservation?.doctor,
          status: updatedReservation?.status,
          location: updatedReservation?.location,
          userDocument: updatedReservation?.userDocument,
          doctorDocument: updatedReservation?.doctorDocument
        }
      })
    };

  } catch (error) {
    console.error('Errore:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Errore interno del server',
        code: 'INTERNAL_ERROR'
      })
    };
  }
};
