import React from 'react';
import { Download, Check, X, AlertCircle } from 'lucide-react';

interface UpdateProgressProps {
  isUpdating: boolean;
  progress: number;
  currentMod: string;
  results?: Array<{
    mod: { file: { name: string } };
    updated: boolean;
    error?: string;
  }>;
}

export const UpdateProgress: React.FC<UpdateProgressProps> = ({
  isUpdating,
  progress,
  currentMod,
  results
}) => {
  if (!isUpdating && !results) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6">
        {isUpdating ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-blue-500 animate-pulse" />
              <h4 className="font-semibold text-gray-800">Updating Mods</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-800">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Currently processing: <span className="font-medium">{currentMod}</span>
            </p>
          </div>
        ) : results ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Update Results</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-800">Updated</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {results.filter(r => r.updated).length}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {results.filter(r => !r.updated).length}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-800">Total</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {results.length}
                </p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.updated ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.updated ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-gray-800">
                      {result.mod.file.name}
                    </span>
                  </div>
                  {result.error && (
                    <span className="text-sm text-red-600">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};