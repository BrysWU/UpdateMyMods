import React from 'react';
import { Settings, Gamepad2, Wrench } from 'lucide-react';

interface VersionSelectorProps {
  selectedVersions: string[];
  onVersionsChange: (versions: string[]) => void;
  selectedLoaders: string[];
  onLoadersChange: (loaders: string[]) => void;
}

const MINECRAFT_VERSIONS = [
  '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16',
  '1.15.2', '1.15.1', '1.15',
  '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14',
  '1.12.2', '1.12.1', '1.12',
];

const MOD_LOADERS = [
  { id: 'forge', name: 'Forge', color: 'from-red-500 to-orange-500' },
  { id: 'fabric', name: 'Fabric', color: 'from-blue-500 to-indigo-500' },
  { id: 'quilt', name: 'Quilt', color: 'from-purple-500 to-pink-500' },
  { id: 'neoforge', name: 'NeoForge', color: 'from-green-500 to-teal-500' },
];

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  selectedVersions,
  onVersionsChange,
  selectedLoaders,
  onLoadersChange
}) => {
  const handleVersionChange = (version: string) => {
    if (selectedVersions.includes(version)) {
      onVersionsChange(selectedVersions.filter(v => v !== version));
    } else {
      onVersionsChange([...selectedVersions, version]);
    }
  };

  const handleLoaderChange = (loader: string) => {
    if (selectedLoaders.includes(loader)) {
      onLoadersChange(selectedLoaders.filter(l => l !== loader));
    } else {
      onLoadersChange([...selectedLoaders, loader]);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 text-gray-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Update Configuration</h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center mb-4">
            <Gamepad2 className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Target Minecraft Versions</h4>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {MINECRAFT_VERSIONS.map(version => (
              <label key={version} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedVersions.includes(version)}
                  onChange={() => handleVersionChange(version)}
                  className="sr-only"
                />
                <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                  selectedVersions.includes(version)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {version}
                </div>
              </label>
            ))}
          </div>
          {selectedVersions.length === 0 && (
            <p className="text-sm text-red-500 mt-3 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Please select at least one Minecraft version
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Wrench className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Target Mod Loaders</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOD_LOADERS.map(loader => (
              <label key={loader.id} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLoaders.includes(loader.id)}
                  onChange={() => handleLoaderChange(loader.id)}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl text-center transition-all duration-200 ${
                  selectedLoaders.includes(loader.id)
                    ? `bg-gradient-to-r ${loader.color} text-white shadow-lg transform scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <div className="font-semibold">{loader.name}</div>
                </div>
              </label>
            ))}
          </div>
          {selectedLoaders.length === 0 && (
            <p className="text-sm text-red-500 mt-3 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Please select at least one mod loader
            </p>
          )}
        </div>
      </div>
    </div>
  );
};