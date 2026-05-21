// api/get-asset-price.ts — Vercel Serverless Function to fetch B3 asset prices
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache for 60 seconds

  const ticker = req.query.ticker;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  try {
    // We add .SA for Brazilian stocks on Yahoo Finance
    const symbol = `${ticker}.SA`.toUpperCase();
    
    // Using Yahoo Finance v8 chart API which is generally open and reliable for basic quotes
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API responded with ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart && data.chart.result && data.chart.result.length > 0) {
      const result = data.chart.result[0];
      const price = result.meta.regularMarketPrice;
      const currency = result.meta.currency;

      if (price) {
        return res.status(200).json({ 
          price: price, 
          currency: currency,
          symbol: ticker
        });
      }
    }
    
    return res.status(404).json({ error: 'Asset data not found or invalid format' });

  } catch (error: any) {
    console.error('Error fetching asset price:', error.message);
    return res.status(500).json({ error: 'Failed to fetch asset price' });
  }
}
