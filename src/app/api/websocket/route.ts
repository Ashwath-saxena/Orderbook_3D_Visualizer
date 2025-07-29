import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const venue = searchParams.get('venue');
  const symbol = searchParams.get('symbol') || 'BTCUSDT';

  if (!venue) {
    return new Response('Venue parameter required', { status: 400 });
  }

  // Create WebSocket connection based on venue
  let wsUrl = '';
  let subscribeMessage = '';

  switch (venue) {
    case 'binance':
      wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`;
      break;
    case 'okx':
      wsUrl = 'wss://ws.okx.com:8443/ws/v5/public';
      subscribeMessage = JSON.stringify({
        op: 'subscribe',
        args: [{
          channel: 'books',
          instId: symbol.replace('USDT', '-USDT')
        }]
      });
      break;
    default:
      return new Response('Unsupported venue', { status: 400 });
  }

  return new Response(JSON.stringify({
    wsUrl,
    subscribeMessage,
    venue,
    symbol
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
