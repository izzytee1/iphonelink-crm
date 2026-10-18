export default function MessageComposer({ pendingFiles, setPendingFiles, fileInputRef, composer, setComposer, sendFromComposer }) {
  return (
                  <div id="composer" className="border-t border-slate-200 bg-white p-2">
                    {pendingFiles.length ? <div id="cmpFiles" className="mb-2 flex flex-wrap gap-1">{pendingFiles.map((file, index) => <button key={`${file.name}-${index}`} type="button" onClick={() => setPendingFiles((files) => files.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-slate-200 px-2 py-1 [font-size:calc(10px+var(--crm-font-offset))] text-slate-500">{file.name} ×</button>)}</div> : null}
                    <div className="flex items-end gap-1.5">
                      <button id="attachBtn" type="button" onClick={() => fileInputRef.current?.click()} className="grid h-8 w-8 place-items-center text-slate-400" aria-label="Attach files">＋</button>
                      <input id="attachInput" ref={fileInputRef} type="file" multiple hidden onChange={(event) => { setPendingFiles((current) => [...current, ...event.target.files]); event.target.value = ''; }} />
                      <textarea id="composerInput" rows={1} value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendFromComposer(); } }} placeholder="Message" className="max-h-24 min-h-8 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs outline-none" />
                      <button id="sendBtn" type="button" onClick={sendFromComposer} className="h-8 rounded-md bg-slate-800 px-3 text-xs font-medium text-white">Send</button>
                    </div>
                  </div>
  );
}
