$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Completely remove the image preview from the form as requested
$oldPreview = @'
                    {newsImg && (
                      <div className="flex items-center gap-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4 group animate-in slide-in-from-top-2">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                          <img src={newsImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Imagem Carregada</p>
                          <p className="text-[9px] text-slate-500 truncate italic">{newsImg}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setNewsImg('')}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
'@
$content = $content.Replace($oldPreview, '')

# Fix 2: Force Scroll ONLY on the feed and fix the rest of the page
$oldMainDiv = 'div className="min-h-screen font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col"'
$newMainDiv = 'div className="h-screen font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-hidden"'
$content = $content.Replace($oldMainDiv, $newMainDiv)

# Fix 3: Adjust the layout to fit the screen height perfectly
$oldGridStart = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-10">'
$newGridStart = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col gap-6 overflow-hidden h-full">'
$content = $content.Replace($oldGridStart, $newGridStart)

$oldNestedGrid = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">'
$newNestedGrid = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 overflow-hidden">'
$content = $content.Replace($oldNestedGrid, $newNestedGrid)

$oldFeedDiv = 'div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-10"'
$newFeedDiv = 'div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20"'
$content = $content.Replace($oldFeedDiv, $newFeedDiv)

# Fix 4: Add a VERY VISIBLE VERSION MARKER
$oldHeader = 'SaaS Management Center <span className="text-[8px] opacity-30 ml-2">v1.2.5</span>'
$newHeader = 'SaaS Management Center <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded ml-2 font-black anim-pulse">v1.3.0 - ATUALIZADO</span>'
$content = $content.Replace($oldHeader, $newHeader)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard image preview removed and layout strictly fixed to scroll only feed!'
