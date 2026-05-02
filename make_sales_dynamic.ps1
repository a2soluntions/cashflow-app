$file = 'e:\A2soluntions\projetos\VittaCash\src\components\SalesPage.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Update News filter to include BOTH 'news' and 'marketing'
# And increase limit to 6 items for a more "alive" radar.
$oldNewsQuery = @'
  const { data: newsData } = await supabase
  .from(''site_content'')
  .select(''*'')
  .eq(''content_type'', ''news'')
  .eq(''is_active'', true)
  .order(''created_at'', { ascending: false })
  .limit(3);
'@
$newNewsQuery = @'
  const { data: newsData } = await supabase
  .from('site_content')
  .select('*')
  .in('content_type', ['news', 'marketing'])
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(6);
'@
$content = $content.Replace($oldNewsQuery, $newNewsQuery)

# Fix 2: Ensure Indicators are fetched from Supabase if API fails
# This makes the values you type in Admin actually appear on the site!
$oldIndicatorFallback = @'
  setIndicators([
  { title: ''SELIC'', value: ''10.75'', symbol: ''%'' },
  { title: ''IPCA'', value: ''4.50'', symbol: ''%'' },
  { title: ''INPC'', value: ''3.90'', symbol: ''%'' },
  { title: ''DÓLAR'', value: ''5.45'', symbol: ''R$'' },
  { title: ''BITCOIN'', value: ''345.200'', symbol: ''R$'' },
  ]);
'@
$newIndicatorFallback = @'
  const { data: indData } = await supabase.from('site_content').select('*').eq('content_type', 'indicator');
  if (indData && indData.length > 0) {
    setIndicators(indData.map(i => ({ 
      title: i.title, 
      value: i.meta_value?.value || '0.00', 
      symbol: i.meta_value?.symbol || '%' 
    })));
  } else {
    setIndicators([
      { title: 'SELIC', value: '10.75', symbol: '%' },
      { title: 'IPCA', value: '4.50', symbol: '%' },
      { title: 'DÓLAR', value: '5.45', symbol: 'R$' },
      { title: 'BITCOIN', value: '345.200', symbol: 'R$' },
    ]);
  }
'@
$content = $content.Replace($oldIndicatorFallback, $newIndicatorFallback)

Set-Content $file $content -Encoding UTF8
Write-Host 'SalesPage is now fully dynamic and showing all content types!'
