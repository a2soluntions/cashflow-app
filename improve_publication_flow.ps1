$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Improve handleAddNews to clear form better and provide visual feedback
$oldAdd = @'
    try {
      const { error } = await supabase.from(''site_content'').insert([{ 
        content_type: contentType, 
        title: newsTitle, 
        description: newsDesc, 
        image_url: newsImg,
        is_active: true,
        meta_value: { external_url: newsUrl }
      }]);
      if (error) throw error;
      setNewsTitle(''''); setNewsDesc(''''); setNewsImg(''''); setNewsUrl(''''); fetchData();
      showAlert("Sucesso", "Conteúdo publicado com sucesso no radar!", "info");
    } catch (err: any) { showAlert("Erro ao salvar", err.message, "error"); } finally { setLoading(false); }
'@
$newAdd = @'
    try {
      const { error } = await supabase.from('site_content').insert([{ 
        content_type: contentType, 
        title: newsTitle, 
        description: newsDesc, 
        image_url: newsImg,
        is_active: true,
        meta_value: { external_url: newsUrl }
      }]);
      
      if (error) throw error;

      // Limpeza agressiva do estado
      setNewsTitle(''); 
      setNewsDesc(''); 
      setNewsImg(''); 
      setNewsUrl('');
      
      await fetchData();
      
      showAlert("Sucesso", "Conteúdo publicado com sucesso!", "info");
      
      // Feedback visual: Rolar para o feed no mobile
      const feedElement = document.querySelector('#active-feed');
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (err: any) { 
      showAlert("Erro ao salvar", err.message, "error"); 
    } finally { 
      setLoading(false); 
    }
'@
$content = $content.Replace($oldAdd, $newAdd)

# Fix 2: Add ID to the feed for scrolling
$content = $content.Replace('h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Feed Ativo', 'h3 id="active-feed" className="text-xs font-black uppercase tracking-widest text-slate-400">Feed Ativo')

# Fix 3: Add loading state to the button
$content = $content.Replace('Publicar no Radar', '{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publicar no Radar"}')

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard publication flow and feedback improved!'
