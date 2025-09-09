import React from 'react';

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
  { id: 'forge', name: 'Forge' },
  { id: 'fabric', name: 'Fabric' },
  { id: 'quilt', name: 'Quilt' },
  { id: 'neoforge', name: 'NeoForge' },
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Target Minecraft Versions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {MINECRAFT_VERSIONS.map(version => (
              <label key={version} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVersions.includes(version)}
                  onChange={() => handleVersionChange(version)}
                  className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{version}</span>
              </label>
            ))}
          </div>
          {selectedVersions.length === 0 && (
            <p className="text-sm text-red-500 mt-2">Please select at least one Minecraft version</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Target Mod Loaders</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOD_LOADERS.map(loader => (
              <label key={loader.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLoaders.includes(loader.id)}
                  onChange={() => handleLoaderChange(loader.id)}
                  className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">{loader.name}</span>
              </label>
            ))}
          </div>
          {selectedLoaders.length === 0 && (
            <p className="text-sm text-red-500 mt-2">Please select at least one mod loader</p>
          )}
        </div>
      </div>
    </div>
  );
};