import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const limit = searchParams.get('limit') || '100';

  try {
    // Convert BTCUSDT to BTC-USDT for OKX
    const instId = symbol.replace('USDT', '-USDT');
    
    const response = await fetch(
      `https://www.okx.com/api/v5/market/books?instId=${instId}&sz=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== '0' || !result.data.length) {
      throw new Error(`OKX API error: ${result.msg}`);
    }

    const data = result.data[0];
    
    // Transform OKX data to our format with explicit typing
    const transformedData = {
      symbol,
      venue: 'okx',
      timestamp: parseInt(data.ts),
      bids: data.bids.map((level: [string, string, string, string]) => ({
        price: parseFloat(level[0]),
        quantity: parseFloat(level[1]),
        cumulativeQuantity: 0,
        orders: 1
      })),
      asks: data.asks.map((level: [string, string, string, string]) => ({
        price: parseFloat(level[0]),
        quantity: parseFloat(level[1]),
        cumulativeQuantity: 0,
        orders: 1
      })),
      spread: 0
    };

    // Calculate cumulative quantities and spread
    let cumBid = 0;
    transformedData.bids.forEach((level: {
      price: number;
      quantity: number;
      cumulativeQuantity: number;
      orders: number;
    }) => {
      cumBid += level.quantity;
      level.cumulativeQuantity = cumBid;
    });

    let cumAsk = 0;
    transformedData.asks.forEach((level: {
      price: number;
      quantity: number;
      cumulativeQuantity: number;
      orders: number;
    }) => {
      cumAsk += level.quantity;
      level.cumulativeQuantity = cumAsk;
    });

    transformedData.spread = transformedData.asks[0]?.price - transformedData.bids[0]?.price || 0;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('OKX API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OKX orderbook' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
