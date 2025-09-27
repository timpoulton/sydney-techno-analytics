'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setUploadResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError('');
        setUploadResult(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !platform) {
      setError('Please select a file and platform');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', platform);

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);

      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-5xl animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Upload Data
        </h1>
        <p className="text-white/60">
          Import event data from your ticketing platforms
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Upload Form */}
        <div className="lg:col-span-2">
          <Card className="apple-card border-white/5">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                CSV File Upload
              </CardTitle>
              <CardDescription className="text-white/60">
                Select your platform and upload the exported CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/80">
                    Platform
                  </label>
                  <Select value={platform} onValueChange={setPlatform} disabled={uploading}>
                    <SelectTrigger
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent className="bg-system-gray-800 border-white/10">
                      <SelectItem value="HUMANITIX">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-system-blue" />
                          Humanitix
                        </div>
                      </SelectItem>
                      <SelectItem value="RESIDENT_ADVISOR">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-system-green" />
                          Resident Advisor
                        </div>
                      </SelectItem>
                      <SelectItem value="MOSHTIX">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-system-purple" />
                          Moshtix
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/80">
                    File Upload
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center">
                      <div className="mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${file ? 'bg-primary/10' : 'bg-white/5'} flex items-center justify-center transition-colors`}>
                          <svg
                            className={`w-8 h-8 ${file ? 'text-primary' : 'text-white/40'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                      </div>

                      {file ? (
                        <div className="space-y-2">
                          <p className="text-base font-medium text-white">
                            {file.name}
                          </p>
                          <p className="text-sm text-white/40">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <Badge className="bg-system-green/10 text-system-green border-0">
                            Ready to upload
                          </Badge>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-base font-medium text-white/80">
                            Drop your CSV file here
                          </p>
                          <p className="text-sm text-white/40">
                            or click to browse
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 rounded-lg bg-system-red/10 border border-system-red/20">
                    <p className="text-sm text-system-red flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {uploadResult && (
                  <div className="p-4 rounded-lg bg-system-green/10 border border-system-green/20 animate-in">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="h-5 w-5 rounded-full bg-system-green/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-system-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-system-green mb-2">
                          Upload Successful
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-white/60">
                            Events processed: <span className="font-mono text-white">{uploadResult.eventsProcessed}</span>
                          </p>
                          <p className="text-white/60">
                            Records processed: <span className="font-mono text-white">{uploadResult.recordsProcessed}</span>
                          </p>
                          {uploadResult.recordsFailed > 0 && (
                            <p className="text-white/60">
                              Records failed: <span className="font-mono text-system-red">{uploadResult.recordsFailed}</span>
                            </p>
                          )}
                        </div>
                        <p className="mt-3 text-xs text-white/40">
                          Redirecting to dashboard...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!file || !platform || uploading}
                  className={`w-full h-12 text-base font-medium transition-all ${
                    !file || !platform || uploading
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload File
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Platform Status */}
          <Card className="apple-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Platform Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Humanitix</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-system-green animate-pulse" />
                  <span className="text-xs text-system-green">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Resident Advisor</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-system-green animate-pulse" />
                  <span className="text-xs text-system-green">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Moshtix</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-system-green animate-pulse" />
                  <span className="text-xs text-system-green">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Guide */}
          <Card className="apple-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                CSV Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-white/80 mb-1">Humanitix</h4>
                <code className="text-xs text-white/40 font-mono block bg-white/5 p-2 rounded">
                  Event, Date, Venue, Type, Price, Qty
                </code>
              </div>

              <div>
                <h4 className="font-medium text-white/80 mb-1">Resident Advisor</h4>
                <code className="text-xs text-white/40 font-mono block bg-white/5 p-2 rounded">
                  Event, Date, Venue, Sold, Revenue
                </code>
              </div>

              <div>
                <h4 className="font-medium text-white/80 mb-1">Moshtix</h4>
                <code className="text-xs text-white/40 font-mono block bg-white/5 p-2 rounded">
                  Title, Date, Venue, Type, Qty, Price
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="apple-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-white/60">Export directly from platform admin</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-white/60">Use YYYY-MM-DD date format</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-white/60">Maximum file size: 10MB</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-white/60">Keep column headers in first row</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}