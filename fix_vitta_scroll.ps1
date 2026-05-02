$file = 'e:\A2soluntions\projetos\VittaCash\src\Vitta.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Main app container - remove forced h-screen and overflow-hidden for internal routes
$old1 = '${location.pathname === ''/'' ? ''min-h-screen'' : ''h-screen overflow-hidden''}'
$new1 = '${location.pathname === ''/'' ? ''min-h-screen'' : ''min-h-screen overflow-x-hidden''}'
$content = $content.Replace($old1, $new1)

# Fix 2: App tab container - allow scroll on admin tab
$old2 = '${[''advisor'', ''admin''].includes(tab) ? ''overflow-hidden'' : ''overflow-y-auto''}'
$new2 = '${[''advisor''].includes(tab) ? ''overflow-hidden'' : ''overflow-y-auto''}'
$content = $content.Replace($old2, $new2)

Set-Content $file $content -Encoding UTF8
Write-Host 'Vitta.tsx scroll fixes applied!'
