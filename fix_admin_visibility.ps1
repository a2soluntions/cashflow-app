$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Main container - allow scroll on mobile, remove overflow-hidden constraint
$old1 = '<div className="h-full font-inter overflow-hidden p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col">'
$new1 = '<div className="min-h-full font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-y-auto custom-scrollbar">'
$content = $content.Replace($old1, $new1)

# Fix 2: Inner wrapper - remove flex-1 min-h-0 which can clip on mobile
$old2 = '<div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0">'
$new2 = '<div className="max-w-7xl w-full mx-auto flex flex-col">'
$content = $content.Replace($old2, $new2)

# Fix 3: Sales Performance Chart - reduce height on mobile
$old3 = '<div className="lg:col-span-2 flex flex-col h-[400px]">'
$new3 = '<div className="lg:col-span-2 flex flex-col h-[300px] md:h-[400px] mb-8">'
$content = $content.Replace($old3, $new3)

# Fix 4: Content grid in "Site & Noticias" - ensure it doesn't force a collapsed state
$old4 = '<div className="animate-in slide-in-from-right-4 duration-500 space-y-6 mt-6 flex-1 flex flex-col min-h-0">'
$new4 = '<div className="animate-in slide-in-from-right-4 duration-500 space-y-8 mt-6 flex flex-col">'
$content = $content.Replace($old4, $new4)

# Fix 5: Feed section container - remove the flex-1 min-h-0 that hides content
$old5 = '<div className="lg:col-span-2 flex flex-col">'
$new5 = '<div className="lg:col-span-2 flex flex-col mt-8 lg:mt-0">'
$content = $content.Replace($old5, $new5)

# Fix 6: Feed list - remove the md:flex-1 and min-h that was added before, make it auto-height
$old6 = '<div className="overflow-y-auto min-h-[300px] md:flex-1 space-y-4 custom-scrollbar pr-2 md:pr-4">'
$new6 = '<div className="space-y-4 pr-2 md:pr-4">'
$content = $content.Replace($old6, $new6)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard visibility fixes applied!'
