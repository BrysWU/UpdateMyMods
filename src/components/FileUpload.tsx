import React, { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  selectedFiles,
  onRemoveFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.jar') || file.name.endsWith('.zip')
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDragOver ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 transition-colors ${
              isDragOver ? 'text-emerald-600' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Drop your mod files here
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Upload .jar and .zip files to automatically detect and update your Minecraft mods
          </p>
          
          <input
            type="file"
            multiple
            accept=".jar,.zip"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </label>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};