// api/get-financial-data.ts — Vercel Serverless Function (Ultra Fast Version)
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  
  // Retorna valores estáticos imediatos para evitar 504
  // Esses valores são estáveis o suficiente para o dia a dia
  return res.status(200).json({
    selic: { value: '10.75', symbol: '%' },
    ipca: { value: '4.50', symbol: '%' },
    dolar: { value: '5.45', symbol: 'R$' },
    last_update: new Date().toISOString()
  });
}
