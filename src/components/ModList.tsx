import React from 'react';
import { DetectedMod } from '../types/mod';
import { Check, X, Search, ExternalLink } from 'lucide-react';

interface ModListProps {
  mods: DetectedMod[];
}

export const ModList: React.FC<ModListProps> = ({ mods }) => {
  if (mods.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-800">Detected Mods ({mods.length})</h4>
      </div>
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {mods.map((mod, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              {mod.status === 'found' && <Check className="h-6 w-6 text-green-500" />}
              {mod.status === 'not_found' && <X className="h-6 w-6 text-red-500" />}
              {mod.status === 'analyzing' && <Search className="h-6 w-6 text-yellow-500 animate-spin" />}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-semibold text-gray-800">{mod.file.name}</h5>
                  <p className="text-sm text-gray-500">
                    Original file: {mod.file.file.name}
                  </p>
                  {mod.file.version && (
                    <p className="text-sm text-gray-500">
                      Current version: {mod.file.version}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    mod.status === 'found'
                      ? 'bg-green-100 text-green-800'
                      : mod.status === 'not_found'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {mod.status === 'found' ? 'Found' : mod.status === 'not_found' ? 'Not Found' : 'Analyzing'}
                </span>
              </div>

              {mod.modrinthMod && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  {mod.modrinthMod.icon_url && (
                    <img 
                      src={mod.modrinthMod.icon_url} 
                      alt={mod.modrinthMod.title}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{mod.modrinthMod.title}</p>
                    <p className="text-sm text-green-600">Found on Modrinth</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-green-600" />
                </div>
              )}

              {mod.curseforgeMod && (
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  {mod.curseforgeMod.logo?.url && (
                    <img 
                      src={mod.curseforgeMod.logo.url} 
                      alt={mod.curseforgeMod.name}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-orange-800">{mod.curseforgeMod.name}</p>
                    <p className="text-sm text-orange-600">Found on CurseForge</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-orange-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};