
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  fileType: 'transaction' | 'expense';
  currentFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileType, currentFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUploadFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndUploadFile(file);
    }
  };

  const validateAndUploadFile = (file: File) => {
    console.log(`Validating file for ${fileType}:`, file.name, file.type, file.size);
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|txt|json)$/i)) {
      alert('Please upload a valid file format (CSV, Excel, TXT, or JSON)');
      return;
    }

    onFileUpload(file);
  };

  const removeFile = () => {
    console.log(`Removing ${fileType} file`);
    // Note: We'd need to pass a remove callback from parent to properly clear the state
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (currentFile) {
    return (
      <Card className="border-2 border-dashed border-green-300 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{currentFile.name}</p>
                <p className="text-sm text-green-600">
                  {formatFileSize(currentFile.size)} • {currentFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-colors duration-200 cursor-pointer hover:border-blue-400",
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
        fileType === 'expense' && !dragActive && "hover:border-green-400"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="p-8 text-center">
        <Upload className={cn(
          "w-12 h-12 mx-auto mb-4",
          fileType === 'transaction' ? "text-blue-400" : "text-green-400"
        )} />
        <p className="text-lg font-medium mb-2">
          Drop your {fileType} file here
        </p>
        <p className="text-gray-500 mb-4">
          or click to browse your files
        </p>
        <Input
          type="file"
          onChange={handleFileInput}
          accept=".csv,.xlsx,.xls,.txt,.json"
          className="hidden"
          id={`file-input-${fileType}`}
        />
        <Button
          onClick={() => document.getElementById(`file-input-${fileType}`)?.click()}
          variant="outline"
          className={cn(
            "mb-4",
            fileType === 'transaction' ? "border-blue-400 text-blue-600 hover:bg-blue-50" : "border-green-400 text-green-600 hover:bg-green-50"
          )}
        >
          Choose File
        </Button>
        <p className="text-xs text-gray-400">
          Supports CSV, Excel, TXT, and JSON files up to 10MB
        </p>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
