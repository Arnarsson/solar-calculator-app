import { NextRequest, NextResponse } from 'next/server';

const MINSTROEM_API_BASE = 'https://api.minstroem.app/thirdParty';

interface SpotPrice {
  date: string;
  price: number;
  color?: string;
}

interface PriceResponse {
  currentPrice: number;
  averagePrice: number;
  prices: SpotPrice[];
  region: string;
  currency: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || 'DK2';

  const apiKey = process.env.MINSTROEM_API_KEY;
  const apiSecret = process.env.MINSTROEM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch spot prices for the region
    const response = await fetch(`${MINSTROEM_API_BASE}/prices/${region}`, {
      headers: {
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      // Try alternative auth header format
      const altResponse = await fetch(`${MINSTROEM_API_BASE}/prices/${region}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-API-Secret': apiSecret,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      });

      if (!altResponse.ok) {
        console.error('Min Strøm API error:', await altResponse.text());
        return NextResponse.json(
          { error: 'Failed to fetch electricity prices' },
          { status: altResponse.status }
        );
      }

      const data = await altResponse.json();
      return processAndReturnPrices(data, region);
    }

    const data = await response.json();
    return processAndReturnPrices(data, region);
  } catch (error) {
    console.error('Error fetching electricity prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch electricity prices' },
      { status: 500 }
    );
  }
}

function processAndReturnPrices(data: SpotPrice[], region: string): NextResponse<PriceResponse> {
  const now = new Date();
  const currentHour = now.getHours();

  // Find current price (closest to current time)
  const currentPrice = data.find((p) => {
    const priceDate = new Date(p.date);
    return priceDate.getHours() === currentHour &&
           priceDate.getDate() === now.getDate();
  })?.price || data[0]?.price || 0;

  // Calculate average price (excluding negative prices for average calculation)
  const validPrices = data.filter((p) => p.price > 0).map((p) => p.price);
  const averagePrice = validPrices.length > 0
    ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
    : 0;

  // Prices are in øre/kWh from the API, convert to DKK/kWh
  // Also add typical fees and taxes (~1.0-1.5 DKK/kWh)
  const FEES_AND_TAXES_DKK = 1.2; // Approximate fees, taxes, grid tariffs

  return NextResponse.json({
    currentPrice: currentPrice / 100 + FEES_AND_TAXES_DKK, // Convert øre to DKK and add fees
    averagePrice: averagePrice / 100 + FEES_AND_TAXES_DKK,
    prices: data.slice(0, 24), // Return next 24 hours
    region,
    currency: 'DKK',
  });
}
