import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModList } from './components/ModList';
import { VersionSelector } from './components/VersionSelector';
import { UpdateProgress } from './components/UpdateProgress';
import { ModParser } from './services/modParser';
import { ModMatcher } from './services/modMatcher';
import { ModUpdater } from './services/modUpdater';
import { DetectedMod, UpdateResult } from './types/mod';
import { Download, Package, ArrowRight, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minecraft Mod Updater</h1>
            <p className="text-gray-600 text-lg">Automatically update your mods to the latest versions</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all ${
              step === 'upload' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 
              ['analyze', 'configure', 'update'].includes(step) ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                step === 'upload' ? 'bg-emerald-500' : 
                ['analyze', 'configure', 'update'].includes(step) ? 'bg-emerald-400' : 'bg-gray-400'
              }`} />
              <span className="font-medium">Upload Files</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all ${
              step === 'analyze' ? 'bg-blue-100 text-blue-700 shadow-sm' : 
              ['configure', 'update'].includes(step) ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                step === 'analyze' ? 'bg-blue-500' : 
                ['configure', 'update'].includes(step) ? 'bg-blue-400' : 'bg-gray-400'
              }`} />
              <span className="font-medium">Analyze Mods</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all ${
              step === 'configure' ? 'bg-purple-100 text-purple-700 shadow-sm' : 
              step === 'update' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                step === 'configure' ? 'bg-purple-500' : 
                step === 'update' ? 'bg-purple-400' : 'bg-gray-400'
              }`} />
              <span className="font-medium">Configure</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all ${
              step === 'update' ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                step === 'update' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="font-medium">Download</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* File Upload */}
          {(step === 'upload' || step === 'analyze') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  selectedFiles={selectedFiles}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </div>
          )}

          {/* Mod List */}
          {detectedMods.length > 0 && (step === 'analyze' || step === 'configure' || step === 'update') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ModList mods={detectedMods} />
            </div>
          )}

          {/* Version Selector */}
          {step === 'configure' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <VersionSelector
                selectedVersions={selectedVersions}
                onVersionsChange={setSelectedVersions}
                selectedLoaders={selectedLoaders}
                onLoadersChange={setSelectedLoaders}
              />
            </div>
          )}

          {/* Update Progress */}
          {step === 'update' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <UpdateProgress
                isUpdating={isUpdating}
                progress={updateProgress}
                currentMod={currentMod}
                results={updateResults.length > 0 ? updateResults : undefined}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            {step === 'upload' && (
              <button
                onClick={handleAnalyzeMods}
                disabled={!canProceedToAnalyze || isAnalyzing}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Mods...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Analyze Mods
                  </>
                )}
              </button>
            )}

            {step === 'configure' && (
              <button
                onClick={handleUpdateMods}
                disabled={!canProceedToUpdate || isUpdating}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Updating Mods...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Update Mods
                  </>
                )}
              </button>
            )}

            {step === 'update' && hasResults && !isUpdating && (
              <button
                onClick={handleDownloadZip}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Updated Mods
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;