$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Improve handleAddNews error reporting
$old1 = '} catch (e) { alert("Erro ao salvar notícia."); } finally { setLoading(false); }'
$new1 = '} catch (err: any) { alert("Erro ao salvar: " + err.message); } finally { setLoading(false); }'
$content = $content.Replace($old1, $new1)

# Fix 2: Add Image Preview and Clear button
$old2 = '<div className="flex gap-2">`n    <input'
$new2 = @'
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
  <div className="flex gap-2">
    <input
'@
$content = $content.Replace($old2, $new2)

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard preview and error logging improved!'
