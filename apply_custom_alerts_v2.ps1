$file = 'e:\A2soluntions\projetos\VittaCash\src\components\AdminDashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Add Alert State and Alert Component
$stateOld = '  const \[loading, setLoading\] = useState\(false\);[\s\n\r]+const \[uploading, setUploading\] = useState\(false\);[\s\n\r]+const fileInputRef = useRef<HTMLInputElement>\(null\);'
$stateNew = @'
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; title: string; message: string; type: 'info' | 'error' | 'confirm'; onConfirm?: () => void } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (title: string, message: string, type: 'info' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ show: true, title, message, type, onConfirm });
  };

  const CustomAlert = () => {
    if (!alertConfig?.show) return null;
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <h4 className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-2">{alertConfig.title}</h4>
          <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">{alertConfig.message}</p>
          
          <div className="flex gap-3">
            {alertConfig.type === 'confirm' && (
              <button 
                onClick={() => setAlertConfig(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={() => {
                if (alertConfig.onConfirm) alertConfig.onConfirm();
                setAlertConfig(null);
              }}
              className={`flex-1 py-3 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg
                ${alertConfig.type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}
              `}
            >
              {alertConfig.type === 'confirm' ? 'Confirmar' : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    );
  };
'@
$content = $content -replace $stateOld, $stateNew

# Fix 2: Replace handleDeleteContent
$deleteOld = 'const handleDeleteContent = async \(id: string\) => \{[\s\n\r]+if \(confirm\("Excluir este item\?"\)\) \{[\s\n\r]+await supabase\.from\(''site_content''\)\.delete\(\)\.eq\(''id'', id\);[\s\n\r]+fetchData\(\);[\s\n\r]+\}[\s\n\r]+\};'
$deleteNew = @'
  const handleDeleteContent = async (id: string) => {
    showAlert(
      "Confirmar Exclusão", 
      "Tem certeza que deseja remover este item do feed? Esta ação não pode ser desfeita.", 
      "confirm",
      async () => {
        await supabase.from('site_content').delete().eq('id', id);
        fetchData();
      }
    );
  };
'@
$content = $content -replace $deleteOld, $deleteNew

# Fix 3: UI Injection
$uiOld = 'return \([\s\n\r]+<div className="min-h-full'
$uiNew = "return (`n    <>`n      <CustomAlert />`n      <div className=`"min-h-full"
$content = $content -replace $uiOld, $uiNew

Set-Content $file $content -Encoding UTF8
Write-Host 'AdminDashboard custom alerts successfully applied via script!'
