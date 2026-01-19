import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

// Stati considerati "attivi"
const ACTIVE_STATUSES = ['In attesa di conferma', 'Confermata'];

interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: string;
  location: string | null;
  createdAt: string;
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
  status: string;
  location?: string | null;
  createdAt: string;
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

    console.log('Cercando prenotazione attiva per utente:', userId);

    // Query per tutte le prenotazioni dell'utente
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'RESERVATION#'
      }
    }));

    console.log(`Trovate ${result.Items?.length || 0} prenotazioni totali`);

    // Filtra per stati attivi
    const activeReservation = ((result.Items || []) as DynamoDBItem[])
      .filter(item => ACTIVE_STATUSES.includes(item.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0]; // Prendi la più recente

    if (!activeReservation) {
      console.log('Nessuna prenotazione attiva trovata');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(null)
      };
    }

    console.log('Prenotazione attiva trovata:', activeReservation.id);

    const response: Reservation = {
      id: activeReservation.id,
      userId: activeReservation.userId,
      date: activeReservation.date,
      time: activeReservation.time,
      category: activeReservation.category,
      doctor: activeReservation.doctor,
      status: activeReservation.status,
      location: activeReservation.location || null,
      createdAt: activeReservation.createdAt
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response)
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
