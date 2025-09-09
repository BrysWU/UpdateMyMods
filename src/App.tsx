import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModList } from './components/ModList';
import { VersionSelector } from './components/VersionSelector';
import { UpdateProgress } from './components/UpdateProgress';
import { ModParser } from './services/modParser';
import { ModMatcher } from './services/modMatcher';
import { ModUpdater } from './services/modUpdater';
import { DetectedMod, UpdateResult } from './types/mod';
import { Download, Package, Settings, Zap } from 'lucide-react';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [detectedMods, setDetectedMods] = useState<DetectedMod[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['1.20.4']);
  const [selectedLoaders, setSelectedLoaders] = useState<string[]>(['fabric']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [currentMod, setCurrentMod] = useState('');
  const [updateResults, setUpdateResults] = useState<UpdateResult[]>([]);
  const [step, setStep] = useState<'upload' | 'analyze' | 'configure' | 'update'>('upload');

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleAnalyzeMods = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setStep('analyze');
    
    const mods: DetectedMod[] = [];
    
    for (const file of selectedFiles) {
      const parsedMod = await ModParser.parseModFile(file);
      const detectedMod = await ModMatcher.findMod(parsedMod);
      mods.push(detectedMod);
      setDetectedMods([...mods]);
    }
    
    setIsAnalyzing(false);
    setStep('configure');
  };

  const handleUpdateMods = async () => {
    if (selectedVersions.length === 0 || selectedLoaders.length === 0) return;

    setIsUpdating(true);
    setStep('update');
    setUpdateResults([]);

    const results = await ModUpdater.updateMods(
      detectedMods,
      selectedVersions,
      selectedLoaders,
      (progress, current) => {
        setUpdateProgress(progress);
        setCurrentMod(current);
      }
    );

    setUpdateResults(results);
    setIsUpdating(false);
  };

  const handleDownloadZip = async () => {
    if (updateResults.length === 0) return;

    try {
      const zipBlob = await ModUpdater.createUpdateZip(updateResults);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minecraft-mods-updated-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip:', error);
    }
  };

  const canProceedToAnalyze = selectedFiles.length > 0;
  const canProceedToUpdate = selectedVersions.length > 0 && selectedLoaders.length > 0;
  const hasResults = updateResults.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minecraft Mod Updater</h1>
              <p className="text-gray-600">Update your mods automatically using Modrinth and CurseForge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'upload' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <Package className="h-4 w-4" />
              <span className="font-medium">Upload</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'analyze' || step === 'configure' || step === 'update' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <Settings className="h-4 w-4" />
              <span className="font-medium">Analyze</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'configure' || step === 'update' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <Zap className="h-4 w-4" />
              <span className="font-medium">Configure</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'update' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <Download className="h-4 w-4" />
              <span className="font-medium">Update</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* File Upload */}
          {(step === 'upload' || step === 'analyze') && (
            <FileUpload
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {step === 'upload' && (
              <button
                onClick={handleAnalyzeMods}
                disabled={!canProceedToAnalyze || isAnalyzing}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Mods'}
              </button>
            )}

            {step === 'configure' && (
              <button
                onClick={handleUpdateMods}
                disabled={!canProceedToUpdate || isUpdating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Updating...' : 'Update Mods'}
              </button>
            )}

            {step === 'update' && hasResults && !isUpdating && (
              <button
                onClick={handleDownloadZip}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download Updated Mods</span>
              </button>
            )}
          </div>

          {/* Mod List */}
          {detectedMods.length > 0 && (step === 'analyze' || step === 'configure' || step === 'update') && (
            <ModList mods={detectedMods} />
          )}

          {/* Version Selector */}
          {step === 'configure' && (
            <VersionSelector
              selectedVersions={selectedVersions}
              onVersionsChange={setSelectedVersions}
              selectedLoaders={selectedLoaders}
              onLoadersChange={setSelectedLoaders}
            />
          )}

          {/* Update Progress */}
          {(step === 'update') && (
            <UpdateProgress
              isUpdating={isUpdating}
              progress={updateProgress}
              currentMod={currentMod}
              results={updateResults.length > 0 ? updateResults : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;