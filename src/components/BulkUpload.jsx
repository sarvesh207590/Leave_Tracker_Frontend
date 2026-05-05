import { useState, useRef } from 'react';
import { bulkUploadEmployees } from '../services/managerService';

/**
 * BulkUpload
 * Drag-and-drop / click-to-upload CSV component for the Manager Dashboard.
 * Shows a live result summary after upload.
 *
 * Expected CSV columns: name, email, password, role
 */
const BulkUpload = () => {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);  // upload response
    const [error, setError] = useState('');

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a .csv file');
            return;
        }
        setError('');
        setResult(null);
        setUploading(true);
        try {
            const data = await bulkUploadEmployees(file);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            // Reset file input so the same file can be re-uploaded if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onFileChange = (e) => handleFile(e.target.files[0]);

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    // Generate a sample CSV for download
    const downloadSample = () => {
        const csv = `name,email,password,role\nJohn Doe,john@company.com,password123,employee\nJane Smith,jane@company.com,password123,employee\nBob Manager,bob@company.com,password123,manager`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_employees.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-700">Bulk Add Employees</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Upload a CSV to create multiple users at once</p>
                </div>
                <button
                    onClick={downloadSample}
                    className="text-xs text-blue-600 hover:underline"
                >
                    ↓ Download sample CSV
                </button>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={onFileChange}
                    className="hidden"
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-3xl mb-2">📂</p>
                        <p className="text-sm font-medium text-gray-600">
                            Drag & drop a CSV file here, or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Columns required: <code className="bg-gray-100 px-1 rounded">name, email, password, role</code>
                        </p>
                    </>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {/* Result summary */}
            {result && (
                <div className="space-y-3">
                    {/* Summary bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                            <p className="text-2xl font-bold text-green-600">{result.summary.succeeded}</p>
                            <p className="text-xs text-green-700">Added</p>
                        </div>
                        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center">
                            <p className="text-2xl font-bold text-red-600">{result.summary.failed}</p>
                            <p className="text-xs text-red-700">Failed</p>
                        </div>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                            <p className="text-2xl font-bold text-gray-600">{result.summary.total}</p>
                            <p className="text-xs text-gray-500">Total rows</p>
                        </div>
                    </div>

                    {/* Failure details */}
                    {result.failures && result.failures.length > 0 && (
                        <div className="border border-red-100 rounded-lg overflow-hidden">
                            <div className="bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                                Failed rows
                            </div>
                            <div className="divide-y divide-red-50 max-h-48 overflow-y-auto">
                                {result.failures.map((f, i) => (
                                    <div key={i} className="px-4 py-2 text-xs text-gray-600 flex flex-col sm:flex-row sm:gap-3">
                                        <span className="text-gray-400 shrink-0">Row {f.row}</span>
                                        <span className="text-gray-500 truncate shrink-0">{f.email}</span>
                                        <span className="text-red-600">{f.errors.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
