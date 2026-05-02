$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Simplify the Site & News Grid Structure
$oldGridStart = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">'
$newGridStart = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-10">'
$content = $content.Replace($oldGridStart, $newGridStart)

# Fix 2: Remove the nested grid that was breaking everything
$oldNestedGrid = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">'
$newNestedGrid = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">'
$content = $content.Replace($oldNestedGrid, $newNestedGrid)

# Fix 3: Ensure Indexadores uses the full width at the top (now inside the flex-col)
$oldIndexadores = '<div>`n                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-6 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>'
$newIndexadores = '<div className="w-full bg-white/5 p-6 rounded-2xl border border-white/5">`n                <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-[#3b82f6] mb-8 text-xs"><TrendingUp size={16}/> Indexadores Econômicos (Manual / Cache)</h3>'
$content = $content.Replace($oldIndexadores, $newIndexadores)

# Fix 4: Fix the News Form and Feed alignment
# The form should be col-span-1 and feed col-span-2 in a 3-column grid
$oldForm = '<div className="lg:col-span-1 text-slate-900 dark:text-white">'
$newForm = '<div className="lg:col-span-1 space-y-6">'
$content = $content.Replace($oldForm, $newForm)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard layout fixed and simplified!'
