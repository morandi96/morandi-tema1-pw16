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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    
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

    console.log('Annullando prenotazione:', reservationId, 'per utente:', userId);

    // Prima verifica che la prenotazione esista e appartenga all'utente
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

    // Aggiorna lo stato della prenotazione a "Annullata"
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `RESERVATION#${reservationId}`
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'Annullata'
      },
      ReturnValues: 'ALL_NEW'
    }));

    console.log('Prenotazione annullata con successo:', reservationId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Prenotazione annullata con successo',
        reservation: updateResult.Attributes
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