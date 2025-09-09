import React from 'react';
import { DetectedMod } from '../types/mod';
import { Check, X, Search, ExternalLink, Package } from 'lucide-react';

interface ModListProps {
  mods: DetectedMod[];
}

export const ModList: React.FC<ModListProps> = ({ mods }) => {
  if (mods.length === 0) return null;

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Package className="h-6 w-6 text-gray-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">
          Detected Mods ({mods.length})
        </h3>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {mods.map((mod, index) => (
          <div
            key={index}
            className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {mod.status === 'found' && (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
                {mod.status === 'not_found' && (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                )}
                {mod.status === 'analyzing' && (
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Search className="h-5 w-5 text-yellow-600 animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{mod.file.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {mod.file.file.name}
                    </p>
                    {mod.file.version && (
                      <p className="text-sm text-gray-500">
                        Version: {mod.file.version}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      mod.status === 'found'
                        ? 'bg-green-100 text-green-700'
                        : mod.status === 'not_found'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {mod.status === 'found' ? 'Found' : mod.status === 'not_found' ? 'Not Found' : 'Analyzing'}
                  </span>
                </div>

                {mod.modrinthMod && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    {mod.modrinthMod.icon_url && (
                      <img 
                        src={mod.modrinthMod.icon_url} 
                        alt={mod.modrinthMod.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{mod.modrinthMod.title}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Available on Modrinth
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-green-600" />
                  </div>
                )}

                {mod.curseforgeMod && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    {mod.curseforgeMod.logo?.url && (
                      <img 
                        src={mod.curseforgeMod.logo.url} 
                        alt={mod.curseforgeMod.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-orange-800">{mod.curseforgeMod.name}</p>
                      <p className="text-sm text-orange-600 flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Available on CurseForge
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-orange-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};