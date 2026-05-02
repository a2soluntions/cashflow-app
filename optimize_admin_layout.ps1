$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Make the main container NOT scrollable, but the feed column YES
$oldMainDiv = 'div className="min-h-full font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-y-auto custom-scrollbar"'
$newMainDiv = 'div className="h-screen font-inter p-4 lg:p-6 transition-colors duration-500 text-slate-900 dark:text-white flex flex-col overflow-hidden"'
$content = $content.Replace($oldMainDiv, $newMainDiv)

# Fix 2: Make the Feed column scrollable
$oldFeedDiv = 'div className="space-y-4 pr-2 md:pr-4"'
$newFeedDiv = 'div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-10"'
$content = $content.Replace($oldFeedDiv, $newFeedDiv)

# Fix 3: Improve Image Preview in Form (Smaller and better styled)
$oldPreview = @'
                    {newsImg && (
                      <div className="group relative w-full aspect-video mb-4 bg-zinc-950 rounded-xl overflow-hidden border border-white/5 ring-1 ring-emerald-500/20">
                        <img src={newsImg} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                          type="button" 
                          onClick={() => setNewsImg('')}
                          className="absolute top-3 right-3 bg-rose-500/90 hover:bg-rose-500 text-white p-2 rounded-lg backdrop-blur-md transition-all shadow-xl"
                          title="Remover imagem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
'@
$newPreview = @'
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
$content = $content.Replace($oldPreview, $newPreview)

# Fix 4: Ensure the Content layout uses the full available height
$oldContentLayout = '<div className="animate-in slide-in-from-right-4 duration-500 space-y-8 mt-6 flex flex-col">'
$newContentLayout = '<div className="animate-in slide-in-from-right-4 duration-500 mt-6 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-250px)]">'
$content = $content.Replace($oldContentLayout, $newContentLayout)

# Fix 5: Wrap News Form in a non-scrolling div
$oldNewsForm = '<div className="text-slate-900 dark:text-white">`n                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Newspaper size={16}/> Compor Conteúdo</h3>'
$newNewsForm = '<div className="w-full lg:w-1/3 text-slate-900 dark:text-white overflow-y-auto custom-scrollbar pr-2 pb-10">`n                  <h3 className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-500 mb-8 text-xs"><Newspaper size={16}/> Compor Conteúdo</h3>'
$content = $content.Replace($oldNewsForm, $newNewsForm)

# Fix 6: Update Feed Container to flex-1
$oldFeedCol = '<div className="lg:col-span-2 flex flex-col mt-8 lg:mt-0">'
$newFeedCol = '<div className="flex-1 flex flex-col mt-8 lg:mt-0 overflow-hidden">'
$content = $content.Replace($oldFeedCol, $newFeedCol)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard UI layout optimized for better usability and fixed preview!'
