$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Revert to a stable main container (Vertical Flow)
$oldMainDiv = 'div className="h-screen font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-hidden"'
$newMainDiv = 'div className="min-h-screen font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col"'
$content = $content.Replace($oldMainDiv, $newMainDiv)

# Fix 2: Stable content container (Grid 1 column on mobile, 3 on desktop)
$oldContentLayout = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-250px)]">'
$newContentLayout = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">'
$content = $content.Replace($oldContentLayout, $newContentLayout)

# Fix 3: Stable form column
$oldNewsForm = '<div className="w-full lg:w-1/3 text-slate-900 dark:text-white overflow-y-auto custom-scrollbar pr-2 pb-10">'
$newNewsForm = '<div className="lg:col-span-1 text-slate-900 dark:text-white">'
$content = $content.Replace($oldNewsForm, $newNewsForm)

# Fix 4: Stable feed column (Limit height and allow scroll only here)
$oldFeedCol = '<div className="flex-1 flex flex-col mt-8 lg:mt-0 overflow-hidden">'
$newFeedCol = '<div className="lg:col-span-2 flex flex-col mt-8 lg:mt-0">'
$content = $content.Replace($oldFeedCol, $newFeedCol)

$oldFeedDiv = 'div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-10"'
$newFeedDiv = 'div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-10"'
$content = $content.Replace($oldFeedDiv, $newFeedDiv)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard layout stabilized and fixed!'
