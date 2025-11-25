'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
    onResumeProcessed: (resumeText: string) => void;
    isProcessing: boolean;
}

export default function ResumeUpload({ onResumeProcessed, isProcessing }: ResumeUploadProps) {
    const [resumeText, setResumeText] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Basic validation
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            setError('For now, please upload text files (.txt, .md) or paste your resume content directly.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setResumeText(text);
            setError(null);
        };
        reader.onerror = () => setError('Error reading file');
        reader.readAsText(file);
    };

    const handleSubmit = () => {
        if (!resumeText.trim()) {
            setError('Please enter your resume content');
            return;
        }
        if (resumeText.length < 50) {
            setError('Resume content seems too short. Please provide more details.');
            return;
        }
        onResumeProcessed(resumeText);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
                <p className="text-purple-100">
                    We&apos;ll analyze your skills and experience to generate a personalized interview session.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* File Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="resume-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept=".txt,.md"
                    />

                    <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500 mt-1">Text files only (.txt, .md)</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or paste text directly</span>
                    </div>
                </div>

                {/* Text Area */}
                <div>
                    <label htmlFor="resume-text" className="block text-sm font-medium text-gray-700 mb-2">
                        Resume Content
                    </label>
                    <textarea
                        id="resume-text"
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        placeholder="Paste your resume text here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !resumeText.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing Resume...</span>
                        </>
                    ) : (
                        <>
                            <FileText className="w-5 h-5" />
                            <span>Generate Interview Questions</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
