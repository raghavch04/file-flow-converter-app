
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [expenseTypeFile, setExpenseTypeFile] = useState<File | null>(null);
  const [transactionsFile, setTransactionsFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipFileUrl, setZipFileUrl] = useState<string | null>(null);
  const [zipFileName, setZipFileName] = useState<string>('');

  const handleFileUpload = (file: File, type: 'expenseType' | 'transactions') => {
    // Validate Excel file
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only Excel files (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    if (type === 'expenseType') {
      setExpenseTypeFile(file);
    } else {
      setTransactionsFile(file);
    }

    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleSubmit = async () => {
    if (!expenseTypeFile || !transactionsFile) {
      toast({
        title: "Missing files",
        description: "Please upload both Expense Type and Transactions files.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('expenseFile', expenseTypeFile);
      formData.append('file', transactionsFile);

      // Replace with your actual API endpoint
      const apiEndpoint = 'http://localhost:8181/api/invoices/upload';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process files');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Get filename from response headers or use default
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'processed-files.zip';
      
      setZipFileUrl(url);
      setZipFileName(filename);

      toast({
        title: "Files processed successfully",
        description: "Your zip file is ready for download.",
      });

    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipFileUrl) return;

    const link = document.createElement('a');
    link.href = zipFileUrl;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your zip file is being downloaded.",
    });
  };

  const removeFile = (type: 'expenseType' | 'transactions') => {
    if (type === 'expenseType') {
      setExpenseTypeFile(null);
    } else {
      setTransactionsFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Excel File Processor
          </h1>
          <p className="text-xl text-gray-600">
            Upload your Expense Type and Transactions Excel files to get processed results
          </p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              Upload Excel Files
            </CardTitle>
            <CardDescription>
              Please upload both required Excel files to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expense Type File Upload */}
            <div className="space-y-2">
              <Label htmlFor="expense-type">Expense Type File</Label>
              {expenseTypeFile ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{expenseTypeFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('expenseType')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    id="expense-type"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'expenseType');
                    }}
                    className="hidden"
                  />
                  <Label htmlFor="expense-type" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Click to upload Expense Type Excel file</p>
                  </Label>
                </div>
              )}
            </div>

            {/* Transactions File Upload */}
            <div className="space-y-2">
              <Label htmlFor="transactions">Transactions File</Label>
              {transactionsFile ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{transactionsFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('transactions')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    id="transactions"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'transactions');
                    }}
                    className="hidden"
                  />
                  <Label htmlFor="transactions" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Click to upload Transactions Excel file</p>
                  </Label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!expenseTypeFile || !transactionsFile || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Process Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Download Section */}
        {zipFileUrl && (
          <Card className="shadow-lg bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Files Processed Successfully!</CardTitle>
              <CardDescription className="text-green-600">
                Your processed files are ready for download as a zip file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium">{zipFileName}</p>
                    <p className="text-sm text-gray-600">Processed zip file</p>
                  </div>
                </div>
                <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
