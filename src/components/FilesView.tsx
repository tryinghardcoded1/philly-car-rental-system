/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  Trash2, 
  Search, 
  FileText, 
  Lock, 
  MoreVertical, 
  Eye, 
  Download, 
  Edit3, 
  ChevronRight,
  Filter,
  CheckCircle,
  FileCode,
  Image,
  Layers,
  Sparkles
} from 'lucide-react';

interface MockFile {
  id: string;
  name: string;
  folderId: string;
  tags: string[];
  author: string;
  size: string;
  date: string;
  docType: 'pdf' | 'png' | 'doc' | 'xlsx';
}

interface MockFolder {
  id: string;
  name: string;
  isLocked?: boolean;
}

export default function FilesView() {
  const [folders, setFolders] = useState<MockFolder[]>([
    { id: 'unsorted', name: 'Unsorted', isLocked: true },
    { id: 'leases', name: 'Lease Agreements' },
    { id: 'kyc', name: 'Identity KYC Docs' },
    { id: 'claims', name: 'Claims Photo Assets' },
    { id: 'maintenance', name: 'Maintenance Log pdfs' }
  ]);

  const [files, setFiles] = useState<MockFile[]>([
    { id: 'f1', name: 'lease_agreement_V1_kutch.pdf', folderId: 'leases', tags: ['Active', 'SaaS Contract'], author: 'philly', size: '2.4 MB', date: '2026-05-30 14:22', docType: 'pdf' },
    { id: 'f2', name: 'driver_license_precious_t.png', folderId: 'kyc', tags: ['Identity', 'KYC Verified'], author: 'hq_admin', size: '1.2 MB', date: '2026-05-28 09:10', docType: 'png' },
    { id: 'f3', name: 'bmw_650i_scratch_report.pdf', folderId: 'claims', tags: ['Damage Claims', 'PHL-850A'], author: 'philly', size: '850 KB', date: '2026-05-25 11:05', docType: 'pdf' },
    { id: 'f4', name: 'preventative_volvo_850_brakes.pdf', folderId: 'maintenance', tags: ['Maintenance', 'OBD Warning'], author: 'telematics_bot', size: '1.8 MB', date: '2026-05-20 17:45', docType: 'pdf' },
    { id: 'f5', name: 'rental_waiver_lucas_f.pdf', folderId: 'leases', tags: ['Active', 'Digital Sign'], author: 'booking_desk', size: '640 KB', date: '2026-05-31 10:15', docType: 'pdf' },
    { id: 'f6', name: 'odometer_unverified_renault.png', folderId: 'unsorted', tags: ['Audit Needed'], author: 'philly', size: '1.5 MB', date: '2026-05-31 16:40', docType: 'png' }
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('leases');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // File upload state simulator
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileTag, setUploadFileTag] = useState('');
  const [uploadFolder, setUploadFolder] = useState('unsorted');

  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Filtering
  const filteredFiles = files.filter(file => {
    const matchesFolder = file.folderId === selectedFolderId;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          file.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFileIds(filteredFiles.map(f => f.id));
    } else {
      setSelectedFileIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newId = newFolderName.toLowerCase().replace(/\s+/g, '-');
    setFolders(prev => [...prev, { id: newId, name: newFolderName }]);
    setSelectedFolderId(newId);
    setNewFolderName('');
    setShowAddFolderModal(false);
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    
    const sizeInMB = (Math.random() * 3 + 0.1).toFixed(1);
    const rightNowString = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newFile: MockFile = {
      id: 'f_upload_' + Math.floor(Math.random() * 1000),
      name: uploadFileName.endsWith('.pdf') || uploadFileName.endsWith('.png') ? uploadFileName : uploadFileName + '.pdf',
      folderId: uploadFolder,
      tags: uploadFileTag ? [uploadFileTag] : ['Uploaded'],
      author: 'philly',
      size: `${sizeInMB} MB`,
      date: rightNowString,
      docType: uploadFileName.endsWith('.png') || uploadFileName.endsWith('.jpg') ? 'png' : 'pdf'
    };

    setFiles(prev => [newFile, ...prev]);
    setSelectedFolderId(uploadFolder);
    setUploadFileName('');
    setUploadFileTag('');
    setShowUploadModal(false);
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedFileIds.length} selected files?`)) {
      setFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
    }
  };

  const handleDeleteFolder = (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder?.isLocked) {
      alert('The Unsorted folder cannot be deleted as it is a system-level archive.');
      return;
    }
    if (confirm(`Delete the "${folder?.name}" folder? Files in this folder will be moved to Unsorted.`)) {
      setFiles(prev => prev.map(f => f.folderId === id ? { ...f, folderId: 'unsorted' } : f));
      setFolders(prev => prev.filter(f => f.id !== id));
      setSelectedFolderId('unsorted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Enterprise Files & CRM Attachments</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Manage digital telemetry outputs, signed rental waivers, and official operator lease folders securely.</p>
        </div>
        
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Grid view containing File explorer layout */}
      <div className="grid grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs min-h-[520px]">
        
        {/* Left Side: Directory navigation panel */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="flex gap-2 justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Folders</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setShowAddFolderModal(true)}
                className="text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 font-bold transition-all"
                title="Add folder"
              >
                + Add Folder
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {folders.map(fold => (
              <div 
                key={fold.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-xs font-semibold font-sans transition cursor-pointer select-none ${
                  selectedFolderId === fold.id 
                    ? 'bg-blue-50 text-blue-800 border border-blue-200/40' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => {
                  setSelectedFolderId(fold.id);
                  setSelectedFileIds([]);
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  {fold.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${selectedFolderId === fold.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  )}
                  <span className="truncate">{fold.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200/60 rounded-full text-slate-500 text-right">
                    {files.filter(f => f.folderId === fold.id).length}
                  </span>
                  {!fold.isLocked && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(fold.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-500 hover:bg-rose-50 rounded transition"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 text-white space-y-2 select-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Drive Space</span>
              <Sparkles className="w-3 h-3 text-yellow-450" />
            </div>
            <div>
              <div className="text-sm font-extrabold font-mono">14.6 MB <span className="text-[10px] font-normal text-slate-400">/ 500 MB</span></div>
              <div className="w-full bg-slate-700 h-1 rounded mt-2.5 overflow-hidden">
                <div className="bg-blue-400 h-1" style={{ width: '3%' }} />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 leading-snug pt-1">Philadelphia office telemetry exports are auto-synced with AWS secure cloud archives nightly.</p>
          </div>
        </div>

        {/* Right Side: Main Files ledger table */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col min-w-0">
          
          {/* Header Action Row */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search file, tag, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
              />
            </div>

            {/* Batch actions */}
            <div className="flex items-center gap-2 justify-end">
              {selectedFileIds.length > 0 && (
                <button 
                  onClick={handleDeleteSelected}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedFileIds.length})</span>
                </button>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {filteredFiles.length} item{filteredFiles.length !== 1 && 's'}
              </span>
            </div>
          </div>

          {/* Files List Table */}
          <div className="flex-1 overflow-x-auto">
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-sans space-y-3">
                <div className="text-3xl text-slate-350">📁</div>
                <h3 className="font-semibold text-slate-700 text-sm">No documents in this folder</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload a PDF contract, signature waivers or driver's license scans key for active audits.</p>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg transition mt-2"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-2.5">File</th>
                    <th className="px-4 py-2.5">Tags</th>
                    <th className="px-4 py-2.5">Author</th>
                    <th className="px-4 py-2.5">Size</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                  {filteredFiles.map(file => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr 
                        key={file.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectOne(file.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded text-[10px] font-mono font-bold uppercase shrink-0">
                              {file.docType}
                            </div>
                            <span 
                              className="font-semibold text-slate-800 text-[12px] truncate max-w-[200px] lg:max-w-[320px] cursor-pointer hover:text-blue-605"
                              title={file.name}
                              onClick={() => alert(`Reviewing metadata for: ${file.name}\nSize: ${file.size}\nAuthor: ${file.author}\nUploaded: ${file.date}`)}
                            >
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {file.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="inline-flex items-center text-[9px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-slate-400">{file.author}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-slate-500">{file.size}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">
                          {file.date}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => alert(`Simulating file stream preview of ${file.name} (Secured via Philly Local storage).`)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              title="Preview document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                alert(`Downloading ${file.name} directly. Status: Successfully written chunk stream.`);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              title="Download to system"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Instigate deletion of ${file.name}?`)) {
                                  setFiles(prev => prev.filter(f => f.id !== file.id));
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD FOLDER */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Add New Folder Directory</h3>
              <button 
                onClick={() => setShowAddFolderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddFolder} className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Folder Title</label>
              <input 
                type="text" 
                placeholder="e.g. Identity Licences, Philly Road Damage Docs"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-450 focus:border-blue-450"
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Establish Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD FILE */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm font-sans">Upload Operator Attachment</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUploadFile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">File Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. contract_philly_122.pdf" 
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Destination Folder</label>
                  <select 
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Classification Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Audit, Active, Claim" 
                    value={uploadFileTag}
                    onChange={(e) => setUploadFileTag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 hover:border-blue-450 transition rounded-xl p-6 text-center select-none space-y-1 cursor-pointer">
                <div className="text-xl">📥</div>
                <h4 className="text-xs font-semibold text-slate-700">Drag file directly here</h4>
                <p className="text-[10px] text-slate-400">Supporting files up to 10MB (PDF, PNG, JPG, Docx)</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 font-bold text-xs"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
                >
                  Verify & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
