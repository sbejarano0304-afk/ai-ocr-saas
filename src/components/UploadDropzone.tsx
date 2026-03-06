"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
    folderId?: string;
}

export function UploadDropzone({ folderId }: UploadDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
            setErrorMessage('');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setErrorMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setErrorMessage('');

        const uploadFolderId = folderId || "123e4567-e89b-12d3-a456-426614174000";
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', uploadFolderId);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setStatus('success');
        } catch (err: any) {
            console.error('Upload Error:', err);
            setStatus('error');
            setErrorMessage(err.message);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-12">
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/png, image/jpeg, application/pdf"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "relative group rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ease-in-out glass",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : status === 'success'
                            ? "border-green-500/50 bg-green-500/5"
                            : status === 'error'
                                ? "border-red-500/50 bg-red-500/5"
                                : "border-border hover:border-primary/50 hover:bg-white/5"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => { if (!file) inputRef.current?.click(); }}
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="p-4 bg-green-500/20 rounded-full"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </motion.div>
                        ) : status === 'error' ? (
                            <motion.div
                                key="error"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="p-4 bg-red-500/20 rounded-full"
                            >
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </motion.div>
                        ) : status === 'uploading' ? (
                            <motion.div
                                key="uploading"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="p-4 bg-primary/20 rounded-full"
                            >
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                animate={{ y: isDragActive ? -10 : 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors"
                            >
                                <UploadCloud className="w-10 h-10 text-primary" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1 z-10">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {status === 'success' ? "Document Processing!" :
                                status === 'uploading' ? "Uploading to secure storage..." :
                                    status === 'error' ? "Upload Failed" :
                                        file ? "File ready for extraction" : "Upload your document"}
                        </h3>
                        <p className="text-sm text-center max-w-sm mx-auto p-1">
                            {status === 'error' ? (
                                <span className="text-red-400 font-medium">{errorMessage}</span>
                            ) : file ? (
                                <span className="text-primary font-medium">{file.name}</span>
                            ) : (
                                <span className="text-muted-foreground">Drag & drop your PDF, PNG, or JPG here, or click to browse</span>
                            )}
                        </p>
                    </div>

                    {!file && status !== 'success' && status !== 'uploading' && (
                        <button
                            className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-medium transition-colors border border-white/10 mt-4 relative z-20"
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        >
                            Select Document
                        </button>
                    )}

                    {file && status === 'idle' && (
                        <div className="flex gap-3 mt-6 relative z-20">
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                                className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-medium transition-colors border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                Extract Data
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="mt-6 relative z-20">
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                                className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-medium transition-colors border border-white/10"
                            >
                                Upload Another
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
