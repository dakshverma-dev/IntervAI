'use client';

import { Clock, Cpu, BarChart3, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: {
    executionTime: number;
    memoryUsage: number;
    complexity: string;
    codeQuality: number;
  };
  interviewMetrics?: {
    timeElapsed: number;
    hintsUsed: number;
    questionsAsked: number;
    currentPhase: string;
    codeSubmissions: number;
  };
}

export default function PerformanceMetrics({ metrics, interviewMetrics }: PerformanceMetricsProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)') || complexity.includes('O(log n)')) return 'text-green-600';
    if (complexity.includes('O(n)')) return 'text-blue-600';
    if (complexity.includes('O(n log n)')) return 'text-yellow-600';
    if (complexity.includes('O(n²)') || complexity.includes('O(n³)')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-4 shadow-sm border border-purple-100">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
        IntervAi Analytics
      </h3>

      <div className="space-y-3">
        {/* Execution Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">Execution Time</span>
          </div>
          <span className="text-xs font-mono text-black">
            {metrics.executionTime > 0 ? `${metrics.executionTime.toFixed(2)}ms` : '-'}
          </span>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">Memory Usage</span>
          </div>
          <span className="text-xs font-mono text-black">
            {metrics.memoryUsage > 0 ? `${metrics.memoryUsage.toFixed(1)}MB` : '-'}
          </span>
        </div>

        {/* Time Complexity */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Time Complexity</span>
          <span className={`text-xs font-mono font-medium ${getComplexityColor(metrics.complexity)}`}>
            {metrics.complexity}
          </span>
        </div>

        {/* Code Quality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getQualityIcon(metrics.codeQuality)}
            <span className="text-xs text-gray-600">Code Quality</span>
          </div>
          <span className={`text-xs font-medium ${getQualityColor(metrics.codeQuality)}`}>
            {metrics.codeQuality > 0 ? `${metrics.codeQuality}%` : '-'}
          </span>
        </div>

        {/* Quality Bar */}
        {metrics.codeQuality > 0 && (
          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${metrics.codeQuality >= 80 ? 'bg-green-500' :
                    metrics.codeQuality >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${metrics.codeQuality}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Interview Metrics Separator */}
        {interviewMetrics && (
          <>
            <div className="border-t border-purple-200 my-3"></div>

            {/* Interview Session Stats */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-purple-700 mb-2">Interview Session</h4>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Session Time</span>
                <span className="text-xs font-mono text-gray-900">
                  {Math.floor(interviewMetrics.timeElapsed / 60)}:{String(interviewMetrics.timeElapsed % 60).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Current Phase</span>
                <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${interviewMetrics.currentPhase === 'reading' ? 'bg-blue-100 text-blue-700' :
                    interviewMetrics.currentPhase === 'coding' ? 'bg-green-100 text-green-700' :
                      interviewMetrics.currentPhase === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                  }`}>
                  {interviewMetrics.currentPhase}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Hints Used</span>
                <span className={`text-xs font-medium ${interviewMetrics.hintsUsed > 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {interviewMetrics.hintsUsed}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Questions Asked</span>
                <span className="text-xs font-medium text-gray-900">
                  {interviewMetrics.questionsAsked}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Code Runs</span>
                <span className="text-xs font-medium text-gray-900">
                  {interviewMetrics.codeSubmissions}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}