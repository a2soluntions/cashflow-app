$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Add visibleCount state for pagination
$oldStates = '  const [contentType, setContentType] = useState(''news'');'
$newStates = '  const [contentType, setContentType] = useState(''news'');`n  const [visibleCount, setVisibleCount] = useState(10);'
$content = $content.Replace($oldStates, $newStates)

# Fix 2: Add overscroll-behavior: contain to the feed container to prevent page scroll chaining
$oldFeedDiv = 'div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20"'
$newFeedDiv = 'div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20 overscroll-contain"'
$content = $content.Replace($oldFeedDiv, $newFeedDiv)

# Fix 3: Implement Pagination in the Feed
$oldFeedMapping = '                    {siteContent.map((item, i) => ('
$newFeedMapping = '                    {siteContent.slice(0, visibleCount).map((item, i) => ('
$content = $content.Replace($oldFeedMapping, $newFeedMapping)

# Fix 4: Add the "Ver Mais" button at the bottom of the feed
$oldFeedEnd = '                    {siteContent.map((item, i) => (' # We use this as anchor
$newFeedEnd = '                    {siteContent.slice(0, visibleCount).map((item, i) => (' # This was already replaced above, we need a better anchor

# Let's find the closing tag of the mapping and add the button
$oldMappingBlock = @'
                    {siteContent.slice(0, visibleCount).map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white/5 rounded-2xl group relative transition-all hover:bg-white/[0.08]">
'@
# This is complex to replace with string replace. I will use a regex-like approach or just append after the loop.

# Better: Find the end of the siteContent.slice map block.
# Actually, I'll just replace the whole Feed section to be safe.

$oldFeedSection = @'
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20 overscroll-contain">
                    {siteContent.length === 0 && (
                      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
                        <Newspaper size={32} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum Conteúdo Publicado</p>
                      </div>
                    )}
                    {siteContent.slice(0, visibleCount).map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white/5 rounded-2xl group relative transition-all hover:bg-white/[0.08]">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover transition-all flex-shrink-0" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <div className="w-full sm:w-24 h-20 sm:h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-tight italic pr-8">
                              <span className={`text-[8px] px-2 py-0.5 rounded-sm mr-2 ${
                                item.content_type === 'news' ? 'bg-indigo-500 text-white' : 
                                item.content_type === 'marketing' ? 'bg-emerald-500 text-white' : 
                                'bg-amber-500 text-black'
                              }`}>
                                {item.content_type === 'news' ? 'Notícia' : 
                                 item.content_type === 'marketing' ? 'Marketing' : 
                                 item.content_type.replace('home_banner_', 'Banner ').toUpperCase()}
                              </span>
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                          {item.meta_value?.external_url && (
                            <a href={item.meta_value.external_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[10px] uppercase font-bold tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">Ver Fonte</a>
                          )}
                        </div>
                        <button onClick={() => handleDeleteContent(item.id)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
'@

$newFeedSection = @'
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-4 pb-20 overscroll-contain">
                    {siteContent.length === 0 && (
                      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
                        <Newspaper size={32} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum Conteúdo Publicado</p>
                      </div>
                    )}
                    
                    {siteContent.slice(0, visibleCount).map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white/5 rounded-2xl group relative transition-all hover:bg-white/[0.08]">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover transition-all flex-shrink-0" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <div className="w-full sm:w-24 h-20 sm:h-24 rounded-xl bg-slate-100 dark:bg-[#09090b] flex items-center justify-center text-slate-300 dark:text-zinc-700">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-tight italic pr-8">
                              <span className={`text-[8px] px-2 py-0.5 rounded-sm mr-2 ${
                                item.content_type === 'news' ? 'bg-indigo-500 text-white' : 
                                item.content_type === 'marketing' ? 'bg-emerald-500 text-white' : 
                                'bg-amber-500 text-black'
                              }`}>
                                {item.content_type === 'news' ? 'Notícia' : 
                                 item.content_type === 'marketing' ? 'Marketing' : 
                                 item.content_type.replace('home_banner_', 'Banner ').toUpperCase()}
                              </span>
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                          {item.meta_value?.external_url && (
                            <a href={item.meta_value.external_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[10px] uppercase font-bold tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">Ver Fonte</a>
                          )}
                        </div>
                        <button onClick={() => handleDeleteContent(item.id)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md"><Trash2 size={16}/></button>
                      </div>
                    ))}

                    {siteContent.length > visibleCount && (
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 transition-all mt-4 mb-10"
                      >
                        Ver Mais Conteúdos ({siteContent.length - visibleCount} restantes)
                      </button>
                    )}
                  </div>
'@

$content = $content.Replace($oldFeedSection, $newFeedSection)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard pagination and scroll chaining fixed!'
