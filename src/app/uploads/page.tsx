'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Eye, Download, Users, Mail, MapPin } from 'lucide-react';

interface Upload {
  id: string;
  filename: string;
  platform: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  createdAt: string;
  processedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [customerMetrics, setCustomerMetrics] = useState<any>(null);

  useEffect(() => {
    fetchUploads();
    fetchCustomerMetrics();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/uploads');
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerMetrics = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomerMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching customer metrics:', error);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload? This will also delete all associated ticket data.')) {
      return;
    }

    setDeleting(uploadId);
    try {
      const response = await fetch(`/api/uploads?id=${uploadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setUploads(uploads.filter(u => u.id !== uploadId));
        // Refresh customer metrics
        fetchCustomerMetrics();
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Failed to delete upload');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'FAILED':
        return 'text-red-400';
      case 'PARTIAL':
        return 'text-yellow-400';
      case 'PROCESSING':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload History</h1>
        <p className="text-white/60">Manage your data uploads and view customer metrics</p>
      </div>

      {/* Customer Metrics Summary */}
      {customerMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-white/60">Total Customers</span>
            </div>
            <div className="text-2xl font-bold">{customerMetrics.totalCustomers || 0}</div>
            <div className="text-xs text-white/60">Unique emails</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-green-400" />
              <span className="text-xs text-white/60">Marketing Opt-ins</span>
            </div>
            <div className="text-2xl font-bold">{customerMetrics.marketingOptIns || 0}</div>
            <div className="text-xs text-white/60">{((customerMetrics.marketingOptIns / customerMetrics.totalCustomers) * 100 || 0).toFixed(1)}% opted in</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-white/60">Postcodes</span>
            </div>
            <div className="text-2xl font-bold">{customerMetrics.uniquePostcodes || 0}</div>
            <div className="text-xs text-white/60">Unique locations</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-white/60">Avg. Tickets/Customer</span>
            </div>
            <div className="text-2xl font-bold">{customerMetrics.avgTicketsPerCustomer?.toFixed(1) || 0}</div>
            <div className="text-xs text-white/60">Per purchase</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/upload"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Upload New CSV
        </Link>
      </div>

      {/* Uploads Table */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/60 font-medium">Filename</th>
              <th className="text-left p-4 text-white/60 font-medium">Platform</th>
              <th className="text-left p-4 text-white/60 font-medium">Status</th>
              <th className="text-left p-4 text-white/60 font-medium">Records</th>
              <th className="text-left p-4 text-white/60 font-medium">Uploaded</th>
              <th className="text-left p-4 text-white/60 font-medium">By</th>
              <th className="text-left p-4 text-white/60 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/40">
                  Loading uploads...
                </td>
              </tr>
            ) : uploads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/40">
                  No uploads found. <Link href="/upload" className="text-primary hover:underline">Upload your first CSV</Link>
                </td>
              </tr>
            ) : (
              uploads.map((upload) => (
                <tr key={upload.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-medium">{upload.filename}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs">
                      {upload.platform}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getStatusColor(upload.status)}`}>
                      {upload.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div>{upload.recordsProcessed} processed</div>
                      {upload.recordsFailed > 0 && (
                        <div className="text-red-400 text-xs">{upload.recordsFailed} failed</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/60">
                    {formatDate(upload.createdAt)}
                  </td>
                  <td className="p-4 text-sm text-white/60">
                    {upload.user?.name || upload.user?.email || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(upload.id)}
                        disabled={deleting === upload.id}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                        title="Delete upload"
                      >
                        {deleting === upload.id ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}