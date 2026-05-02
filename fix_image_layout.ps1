$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Compact and better styled Image Preview
$oldPreview = @'
                    {newsImg && (
                      <div className="relative w-full h-32 mb-2 bg-black/20 rounded-lg overflow-hidden border border-emerald-500/30">
                        <img src={newsImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button" 
                          onClick={() => setNewsImg('')}
                          className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
'@
$newPreview = @'
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
$content = $content.Replace($oldPreview, $newPreview)

# Fix 2: Ensure crossOrigin is NOT used for Supabase URLs as it might block rendering if CORS is not perfectly set
$oldImg = 'referrerPolicy="no-referrer" crossOrigin="anonymous"'
$newImg = 'referrerPolicy="no-referrer"'
$content = $content.Replace($oldImg, $newImg)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard form layout and image handling improved!'
