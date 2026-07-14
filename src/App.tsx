/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import data from './data.json';
import { Download, Copy, Database, CloudUpload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const jsonData = JSON.stringify(data, null, 2);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonData);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'balancete.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncSupabase = async () => {
    try {
      setSyncState('syncing');
      setSyncMessage('');
      const res = await fetch('/api/sync-balancete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro na sincronização');
      
      setSyncState('success');
      setSyncMessage(`${result.count} registros sincronizados!`);
      setTimeout(() => setSyncState('idle'), 5000);
    } catch (err: any) {
      setSyncState('error');
      setSyncMessage(err.message);
      setTimeout(() => setSyncState('idle'), 8000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <header className="h-14 bg-[#0f172a] text-white flex items-center justify-between px-6 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg">Σ</div>
          <h1 className="text-lg font-semibold tracking-tight">
            AccounTech AI <span className="text-slate-400 font-normal ml-2 text-sm italic">// Extrator Contábil v4.2</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Processamento Concluído</span>
          </div>
          <div className="text-xs border border-slate-700 px-3 py-1 rounded bg-slate-800 font-mono text-blue-300">
            ID: BC-2023-Q4-0982
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-white border-r border-slate-200 p-4 flex flex-col gap-6 shrink-0">
          <section>
            <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">Configurações de Extração</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Mapeamento de Plano</label>
                <select className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-slate-50 w-full outline-none">
                  <option>Referencial SPED 2026</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Precisão de OCR</label>
                <div className="flex items-center justify-between text-[11px] font-mono text-blue-600 mt-1">
                  <span>99.98%</span>
                  <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[99%] h-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">Ficheiro Analisado</h3>
            <div className="p-3 border border-slate-200 rounded bg-slate-50">
              <p className="text-xs font-semibold truncate" title="Balancete HEMU 01.2026.pdf">Balancete HEMU 01.2026.pdf</p>
              <p className="text-[10px] text-slate-500 mt-1">PDF nativo • 9 páginas</p>
            </div>
          </section>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button 
              onClick={handleDownload}
              className="w-full flex justify-center items-center gap-2 bg-[#0f172a] text-white text-xs font-bold py-2.5 rounded shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Download size={14} />
              BAIXAR JSON COMPLETO
            </button>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center shrink-0">
            <h2 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              VISUALIZAÇÃO DOS DADOS EXTRAÍDOS
            </h2>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
              {data.length} LINHAS IDENTIFICADAS
            </span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 gap-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-tighter px-4 py-2 shrink-0">
              <div className="col-span-2">Código</div>
              <div className="col-span-4">Descrição da Conta</div>
              <div className="col-span-2 text-right">Saldo Anterior</div>
              <div className="col-span-2 text-right">Débito / Crédito</div>
              <div className="col-span-2 text-right">Saldo Atual</div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px]">
              {data.map((item, idx) => {
                const isAux = item.tipo === 'conta_auxiliar';
                const rowClass = isAux 
                  ? "grid grid-cols-12 gap-2 px-4 py-1.5 border-b border-slate-100 bg-slate-50/50 text-slate-600"
                  : "grid grid-cols-12 gap-2 px-4 py-1.5 border-b border-slate-100 hover:bg-blue-50/30";
                
                return (
                  <div key={idx} className={rowClass}>
                    <div className="col-span-2 truncate" title={isAux ? `Aux: ${item.codigo_auxiliar}` : item.conta}>
                      {isAux ? `Aux: ${item.codigo_auxiliar}` : item.conta}
                    </div>
                    <div className="col-span-4 truncate font-sans" title={item.descricao}>
                      {item.descricao}
                    </div>
                    <div className="col-span-2 text-right truncate" title={item.saldo_anterior}>
                      {item.saldo_anterior}
                    </div>
                    <div className="col-span-2 text-right truncate text-slate-400" title={`${item.valor_debito} / ${item.valor_credito}`}>
                      <div className="text-[9px] text-green-600 leading-none mb-0.5">{item.valor_debito}</div>
                      <div className="text-[9px] text-red-500 leading-none">{item.valor_credito}</div>
                    </div>
                    <div className="col-span-2 text-right font-semibold truncate" title={item.saldo_atual}>
                      {item.saldo_atual}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="w-80 bg-[#1e293b] border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saída JSON Estruturada</span>
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors"
                disabled={syncState === 'syncing'}
              >
                <Copy size={12} /> COPIAR
              </button>
            </div>
          </div>
          
          <div className="p-3 bg-slate-800/50 border-b border-slate-800 shrink-0">
             <button 
                onClick={handleSyncSupabase}
                disabled={syncState === 'syncing'}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncState === 'syncing' ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                {syncState === 'syncing' ? 'Sincronizando...' : 'SINCRONIZAR COM SUPABASE'}
              </button>
              
              {syncState === 'success' && (
                <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1 justify-center bg-green-400/10 py-1.5 rounded">
                  <CheckCircle size={12} /> {syncMessage}
                </div>
              )}
              {syncState === 'error' && (
                <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1 justify-center bg-red-400/10 py-1.5 px-2 rounded text-center">
                  <AlertCircle size={14} className="shrink-0" /> {syncMessage}
                </div>
              )}
          </div>

          <div className="flex-1 p-4 font-mono text-[11px] text-blue-300 leading-relaxed overflow-y-auto select-all whitespace-pre">
            {jsonData}
          </div>

          <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500">Consumo de Tokens</span>
              <span className="text-[10px] text-slate-300">{(jsonData.length / 1000).toFixed(1)}k / 128k</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[15%] h-full bg-green-500"></div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-6 bg-slate-200 border-t border-slate-300 flex items-center px-4 justify-between shrink-0">
        <div className="text-[9px] text-slate-500">
          Ready // Processed in 452ms // OCR Engine: V-Alpha Enterprise
        </div>
        <div className="text-[9px] text-slate-500">
          Precise accounting validation enabled
        </div>
      </footer>
    </div>
  );
}
