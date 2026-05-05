import { useState } from 'react';
import Navbar from '../components/Navbar';
import AddEmployee from '../components/AddEmployee';
import BulkUpload from '../components/BulkUpload';

/**
 * AddEmployeePage
 * Dedicated page for managers to add employees — either one at a time or via CSV bulk upload.
 * Uses a tab switcher to toggle between the two modes.
 */
const AddEmployeePage = () => {
    const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Add Employee</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Add a single employee or upload multiple via CSV
                    </p>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'single'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        👤 Single Employee
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'bulk'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📋 Bulk Upload
                    </button>
                </div>

                {/* Tab content */}
                {activeTab === 'single' ? <AddEmployee /> : <BulkUpload />}
            </main>
        </div>
    );
};

export default AddEmployeePage;
