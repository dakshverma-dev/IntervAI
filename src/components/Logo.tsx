import { BrainCircuit } from 'lucide-react';

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">IntervAi</span>
        </div>
    );
}
