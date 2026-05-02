$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Add useRef and Upload icon to imports
$content = $content -replace "import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo, useRef } from 'react';"
$content = $content -replace 'Newspaper, Save, Image as ImageIcon', 'Newspaper, Save, Image as ImageIcon, Upload, Loader2'

# Fix 2: Add useRef and upload state to the component
$content = $content -replace 'const \[loading, setLoading\] = useState\(false\);', 'const [loading, setLoading] = useState(false);`n  const [uploading, setUploading] = useState(false);`n  const fileInputRef = useRef<HTMLInputElement>(null);'

# Fix 3: Add handleFileUpload function
$uploadFunc = @'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      setNewsImg(data.publicUrl);
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

'@
$content = $content -replace '  // --- AÇÕES CONTEÚDO ---', "$uploadFunc`n  // --- AÇÕES CONTEÚDO ---"

# Fix 4: Update the image input UI to include upload button
$oldInput = '<div>`n  <input className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none  transition-colors placeholder:text-slate-400" placeholder="Link da Imagem (URL completa)" value={newsImg} onChange={e => setNewsImg(e.target.value)} />`n  </div>'
$newInput = @'
  <div className="flex gap-2">
    <input 
      className="flex-1 bg-slate-100 dark:bg-white/5 p-3 rounded-lg font-bold text-sm outline-none transition-colors placeholder:text-slate-400" 
      placeholder="Link da Imagem (URL)" 
      value={newsImg} 
      onChange={e => setNewsImg(e.target.value)} 
    />
    <button 
      type="button"
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading}
      className="px-3 bg-slate-100 dark:bg-white/5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center border border-white/5"
      title="Upload de arquivo"
    >
      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
    </button>
    <input 
      type="file" 
      ref={fileInputRef} 
      className="hidden" 
      onChange={handleFileUpload} 
      accept="image/*" 
    />
  </div>
'@
# Using a more robust match for the input div
$content = $content -replace 'placeholder="Link da Imagem \(URL completa\)" value=\{newsImg\} onChange=\{e =\> setNewsImg\(e\.target\.value\)\} \/\>\s+<\/div>', $newInput

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard upload feature applied!'
