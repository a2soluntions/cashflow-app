$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: img - add referrerPolicy, crossOrigin and onerror fallback so external images render
$old1 = '<img src={item.image_url} className="w-24 h-24 rounded-xl object-cover transition-all" />'
$new1 = '<img src={item.image_url} className="w-24 h-24 rounded-xl object-cover transition-all flex-shrink-0" referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).style.display=''none''; }} />'
$content = $content.Replace($old1, $new1)

# Fix 2: Feed section - fix height on mobile (add min-h on container)
$old2 = '<div className="overflow-y-auto flex-1 space-y-4 custom-scrollbar pr-4">'
$new2 = '<div className="overflow-y-auto min-h-[300px] md:flex-1 space-y-4 custom-scrollbar pr-2 md:pr-4">'
$content = $content.Replace($old2, $new2)

# Fix 3: Feed items - fix layout on small screens (stack instead of side-by-side)
$old3 = '<div key={item.id} className="flex gap-5 p-5 bg-transparent rounded-2xl group relative transition-all ">'
$new3 = '<div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white/5 rounded-2xl group relative transition-all">'
$content = $content.Replace($old3, $new3)

# Fix 4: Feed image - smaller on mobile
$old4 = '<img src={item.image_url} className="w-24 h-24 rounded-xl object-cover transition-all flex-shrink-0"'
$new4 = '<img src={item.image_url} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover transition-all flex-shrink-0"'
$content = $content.Replace($old4, $new4)

# Fix 5: Placeholder icon - also full width on mobile
$old5 = '<div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">'
$new5 = '<div className="w-full sm:w-24 h-20 sm:h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">'
$content = $content.Replace($old5, $new5)

# Fix 6: Content grid - stack on mobile
$old6 = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">'
$new6 = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">'
$content = $content.Replace($old6, $new6)

# Fix 7: Feed column - ensure it has height on mobile
$old7 = '<div className="lg:col-span-2 flex flex-col min-h-0">'
$new7 = '<div className="lg:col-span-2 flex flex-col">'
$content = $content.Replace($old7, $new7)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard.tsx mobile fixes applied!'
