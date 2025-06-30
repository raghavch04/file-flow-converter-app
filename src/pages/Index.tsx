
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import FilePreview from '../components/FilePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [transactionFile, setTransactionFile] = useState<File | null>(null);
  const [expenseFile, setExpenseFile] = useState<File | null>(null);
  const [convertedData, setConvertedData] = useState<any>(null);
  const [activePreview, setActivePreview] = useState<'transaction' | 'expense' | null>(null);

  const handleFileUpload = (file: File, type: 'transaction' | 'expense') => {
    console.log(`Uploading ${type} file:`, file.name);
    
    if (type === 'transaction') {
      setTransactionFile(file);
    } else {
      setExpenseFile(file);
    }
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded for ${type} processing.`,
    });
  };

  const handlePreview = (type: 'transaction' | 'expense') => {
    const file = type === 'transaction' ? transactionFile : expenseFile;
    if (file) {
      setActivePreview(type);
      console.log(`Previewing ${type} file:`, file.name);
    }
  };

  const handleConvert = async () => {
    if (!transactionFile && !expenseFile) {
      toast({
        title: "No files to convert",
        description: "Please upload at least one file before converting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Converting files...");
    
    // Simulate file conversion process
    const mockConvertedData = {
      transactions: transactionFile ? await processFile(transactionFile) : null,
      expenses: expenseFile ? await processFile(expenseFile) : null,
      convertedAt: new Date().toISOString(),
    };
    
    setConvertedData(mockConvertedData);
    
    toast({
      title: "Files converted successfully",
      description: "Your files have been processed and are ready for download.",
    });
  };

  const processFile = (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        resolve({
          fileName: file.name,
          size: file.size,
          type: file.type,
          content: content,
          processedRows: Math.floor(Math.random() * 100) + 10,
        });
      };
      reader.readAsText(file);
    });
  };

  const handleDownload = () => {
    if (!convertedData) return;
    
    const dataStr = JSON.stringify(convertedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-files-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("File downloaded");
    toast({
      title: "Download complete",
      description: "Your converted file has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            File Conversion Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your transaction and expense files, preview their contents, and download converted formats with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transaction Upload */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <FileText className="w-6 h-6 text-blue-600" />
                Transaction Files
              </CardTitle>
              <CardDescription>
                Upload your transaction data files for processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileUpload={(file) => handleFileUpload(file, 'transaction')}
                fileType="transaction"
                currentFile={transactionFile}
              />
              {transactionFile && (
                <Button
                  onClick={() => handlePreview('transaction')}
                  variant="outline"
                  className="w-full"
                >
                  Preview Transaction File
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Expense Upload */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <FileText className="w-6 h-6 text-green-600" />
                Expense Files
              </CardTitle>
              <CardDescription>
                Upload your expense data files for processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileUpload={(file) => handleFileUpload(file, 'expense')}
                fileType="expense"
                currentFile={expenseFile}
              />
              {expenseFile && (
                <Button
                  onClick={() => handlePreview('expense')}
                  variant="outline"
                  className="w-full"
                >
                  Preview Expense File
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={handleConvert}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            disabled={!transactionFile && !expenseFile}
          >
            <Upload className="w-5 h-5 mr-2" />
            Convert Files
          </Button>
          
          <Button
            onClick={handleDownload}
            size="lg"
            variant="outline"
            className="px-8 py-3"
            disabled={!convertedData}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Converted
          </Button>
        </div>

        <Separator className="my-8" />

        {/* File Preview Section */}
        {activePreview && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                File Preview - {activePreview.charAt(0).toUpperCase() + activePreview.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilePreview
                file={activePreview === 'transaction' ? transactionFile : expenseFile}
                onClose={() => setActivePreview(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* Conversion Status */}
        {convertedData && (
          <Card className="shadow-lg bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Conversion Complete!</CardTitle>
              <CardDescription className="text-green-600">
                Your files have been successfully processed and are ready for download.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {convertedData.transactions && (
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold mb-2">Transaction Data</h4>
                    <p className="text-sm text-gray-600">
                      Processed {convertedData.transactions.processedRows} rows
                    </p>
                  </div>
                )}
                {convertedData.expenses && (
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold mb-2">Expense Data</h4>
                    <p className="text-sm text-gray-600">
                      Processed {convertedData.expenses.processedRows} rows
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
