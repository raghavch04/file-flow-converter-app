
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, FileText, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilePreviewProps {
  file: File | null;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    console.log('Previewing file:', file.name);
    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          // Pretty print JSON
          const jsonData = JSON.parse(result);
          setContent(JSON.stringify(jsonData, null, 2));
        } else {
          setContent(result || '');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Failed to read file content. The file might be corrupted or in an unsupported format.');
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  }, [file]);

  if (!file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileInfo = () => {
    const lines = content.split('\n').length;
    const chars = content.length;
    return { lines, chars };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading file content...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-600">
          <Info className="w-5 h-5 mr-2" />
          {error}
        </div>
      );
    }

    if (file.type.includes('image')) {
      const url = URL.createObjectURL(file);
      return (
        <div className="flex justify-center">
          <img src={url} alt="Preview" className="max-w-full max-h-96 object-contain" />
        </div>
      );
    }

    // Handle CSV content with basic table formatting
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      const lines = content.split('\n').slice(0, 10); // Show first 10 rows
      const rows = lines.map(line => line.split(','));
      
      if (rows.length > 0) {
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {rows[0].map((header, index) => (
                      <th key={index} className="border border-gray-300 px-2 py-1 text-left text-sm font-medium">
                        {header.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-2 py-1 text-sm">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.split('\n').length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                Showing first 10 rows of {content.split('\n').length} total rows
              </p>
            )}
          </div>
        );
      }
    }

    return (
      <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg">
        {content.length > 5000 ? content.substring(0, 5000) + '\n\n... (content truncated)' : content}
      </pre>
    );
  };

  const { lines, chars } = getFileInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-medium">{file.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
              <Badge variant="secondary">{file.type || 'Unknown type'}</Badge>
              {!loading && !error && (
                <Badge variant="secondary">{lines} lines, {chars} chars</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="h-96 w-full border rounded-lg">
        <div className="p-4">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FilePreview;
