"use client";

import { useState } from "react";
import { X, Maximize2 } from "lucide-react";

interface ExtractedDataModalProps {
    data: any;
}

export function ExtractedDataModal({ data }: ExtractedDataModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!data) return null;

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="truncate text-xs font-mono bg-black/40 p-2 rounded border border-white/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-between group"
                title="Click to view full extracted data"
            >
                <span className="truncate">{JSON.stringify(data)}</span>
                <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-[#111] border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-semibold text-lg">OCR Extracted Data</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <pre className="text-sm font-mono text-green-400 bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
