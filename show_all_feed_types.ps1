$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Update the filter to show ALL content types in the Admin Feed
# This will make banners visible so the user can manage them.
$oldFilter1 = 'siteContent.filter(c => c.content_type === ''news'' || c.content_type === ''marketing'').length'
$newFilter1 = 'siteContent.length'
$content = $content.Replace($oldFilter1, $newFilter1)

$oldFilter2 = 'siteContent.filter(c => c.content_type === ''news'' || c.content_type === ''marketing'').map'
$newFilter2 = 'siteContent.map'
$content = $content.Replace($oldFilter2, $newFilter2)

# Fix 2: Improve the Badge rendering for Banners
$oldBadge = @'
                              <span className={`text-[8px] px-2 py-0.5 rounded-sm mr-2 ${item.content_type === 'news' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                {item.content_type === 'news' ? 'Notícia' : 'Marketing'}
                              </span>
'@
$newBadge = @'
                              <span className={`text-[8px] px-2 py-0.5 rounded-sm mr-2 ${
                                item.content_type === 'news' ? 'bg-indigo-500 text-white' : 
                                item.content_type === 'marketing' ? 'bg-emerald-500 text-white' : 
                                'bg-amber-500 text-black'
                              }`}>
                                {item.content_type === 'news' ? 'Notícia' : 
                                 item.content_type === 'marketing' ? 'Marketing' : 
                                 item.content_type.replace('home_banner_', 'Banner ').toUpperCase()}
                              </span>
'@
$content = $content.Replace($oldBadge, $newBadge)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard feed now shows ALL content types including banners!'
