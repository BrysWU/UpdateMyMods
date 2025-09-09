import React from 'react';
import { Download, Check, X, AlertCircle, Loader, TrendingUp } from 'lucide-react';

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
    <div className="p-8">
      {isUpdating ? (
        <div className="space-y-6">
          <div className="flex items-center">
            <Loader className="h-6 w-6 text-blue-600 animate-spin mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Updating Your Mods</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-lg font-semibold text-gray-800">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-800 font-medium">Currently processing:</p>
              <p className="text-blue-600 text-sm mt-1">{currentMod}</p>
            </div>
          </div>
        </div>
      ) : results ? (
        <div className="space-y-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Update Complete</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-semibold">Successfully Updated</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {results.filter(r => r.updated).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 font-semibold">Failed to Update</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {results.filter(r => !r.updated).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 font-semibold">Total Processed</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {results.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-gray-800 mb-3">Detailed Results</h4>
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  result.updated 
                    ? 'bg-green-50 border-green-100' 
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    result.updated ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.updated ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800">
                    {result.mod.file.name}
                  </span>
                </div>
                {result.error && (
                  <span className="text-sm text-red-600 max-w-xs truncate">
                    {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};