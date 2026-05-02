$file = 'e:\A2soluntions\projetos\VittaCash\src\components\SalesPage.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Standardize Right Banner to object-cover (it was object-contain)
$oldRight = 'className="w-full h-full object-contain transition-opacity duration-700"'
$newRight = 'className="w-full h-full object-cover hover:scale-105 transition-all duration-700"'
$content = $content.Replace($oldRight, $newRight)

# Fix 2: Also update the fallback image for Right Banner
$oldRightFallback = 'className="w-full h-full object-contain"'
$newRightFallback = 'className="w-full h-full object-cover"'
$content = $content.Replace($oldRightFallback, $newRightFallback)

# Fix 3: Ensure Left Banner also has the hover effect for premium feel
$oldLeft = 'className="w-full h-full object-cover transition-opacity duration-700"'
$newLeft = 'className="w-full h-full object-cover hover:scale-105 transition-all duration-700"'
$content = $content.Replace($oldLeft, $newLeft)

# Fix 4: Improve Radar Vitta (News) images to ensure they fill the container perfectly
$oldNewsImg = 'className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"'
$newNewsImg = 'className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"'
$content = $content.Replace($oldNewsImg, $newNewsImg)

# Fix 5: Add a subtle border and shadow to the banners for depth
$oldBannerContainer = 'overflow-hidden border border-white/10 bg-zinc-900 group relative shrink-0'
$newBannerContainer = 'overflow-hidden border border-white/10 bg-zinc-950 group relative shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-lg'
$content = $content.Replace($oldBannerContainer, $newBannerContainer)

Set-Content $file $content -Encoding UTF8
Write-Host 'Carousel and Radar images now auto-adjust with object-cover and premium effects!'
