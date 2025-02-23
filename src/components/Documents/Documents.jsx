import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2, FiDownload, FiEye, FiLock } from 'react-icons/fi';
import CryptoJS from 'crypto-js';
import './Documents.css';

function Documents() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('document')
        .list('documents', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (storageError) throw storageError;

      // Get URLs and verification data for all documents
      const documentsWithData = await Promise.all(
        (storageData || []).map(async (doc) => {
          const { data: { publicUrl } } = supabase.storage
            .from('document')
            .getPublicUrl(`documents/${encodeURIComponent(doc.name)}`);

          try {
            // Get verification data from metadata
            const { data: metadata, error: verificationError } = await supabase
              .from('document_verifications')
              .select('*')
              .eq('document_name', doc.name)
              .maybeSingle();

            if (verificationError) throw verificationError;

            return {
              ...doc,
              url: publicUrl,
              verified: !!metadata,
              verificationData: metadata
            };
          } catch (error) {
            console.error('Error fetching verification data:', error);
            return {
              ...doc,
              url: publicUrl,
              verified: false,
              verificationData: null
            };
          }
        })
      );

      setDocuments(documentsWithData);
    } catch (error) {
      showNotification('Error fetching documents: ' + error.message, 'error');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Create a hash for the document
  const createDocumentHash = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Create a block for the document
  const createBlock = (hash, previousHash, document) => {
    const timestamp = new Date().getTime();
    const blockData = {
      hash,
      previousHash,
      timestamp,
      document: {
        name: document.name,
        size: document.size,
        type: document.type
      }
    };
    
    // Create block hash
    const blockHash = CryptoJS.SHA256(JSON.stringify(blockData)).toString();
    return { ...blockData, blockHash };
  };

  const uploadDocument = async () => {
    if (!file) {
      showNotification('Please select a file first', 'error');
      return;
    }

    setUploading(true);

    try {
      // Sanitize filename - replace spaces and special characters
      const sanitizedFileName = file.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      
      // Generate document hash
      const documentHash = await createDocumentHash(file);

      // Get previous block hash (if any)
      const { data: lastBlock, error: blockError } = await supabase
        .from('document_verifications')
        .select('block_hash')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (blockError) throw blockError;

      // Create new block
      const block = createBlock(
        documentHash,
        lastBlock?.block_hash || '0',
        { ...file, name: sanitizedFileName }
      );

      // Upload document to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('document')
        .upload(`documents/${sanitizedFileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Store verification data
      const { error: verificationError } = await supabase
        .from('document_verifications')
        .insert([
          {
            document_name: sanitizedFileName,
            document_hash: documentHash,
            block_hash: block.blockHash,
            previous_hash: block.previousHash,
            verification_data: block
          }
        ]);

      if (verificationError) throw verificationError;

      showNotification('Document uploaded and verified!', 'success');
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (error) {
      showNotification('Error uploading document: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const verifyDocument = async (doc) => {
    try {
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const blob = await response.blob();
      const hash = await createDocumentHash(blob);
      
      const { data: verificationData, error: verificationError } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('document_name', doc.name)
        .maybeSingle();

      if (verificationError) throw verificationError;

      if (verificationData && verificationData.document_hash === hash) {
        showNotification('Document verification successful!', 'success');
      } else {
        showNotification('Document verification failed!', 'error');
      }
    } catch (error) {
      showNotification('Error verifying document: ' + error.message, 'error');
    }
  };

  const deleteDocument = async (fileName) => {
    try {
      const { error } = await supabase.storage
        .from('document')
        .remove([`documents/${fileName}`]);

      if (error) throw error;

      showNotification('Document deleted successfully!', 'success');
      fetchDocuments();
    } catch (error) {
      showNotification('Error deleting document: ' + error.message, 'error');
    }
  };

  const downloadDocument = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('document')
        .download(`documents/${fileName}`);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showNotification('Error downloading document: ' + error.message, 'error');
    }
  };

  const viewDocument = async (fileName, url) => {
    try {
      // For PDFs and images, we can view them directly
      if (fileName.match(/\.(pdf|jpg|jpeg|png|gif)$/i)) {
        window.open(url, '_blank');
      } else {
        // For other file types, download them
        await downloadDocument(fileName);
      }
    } catch (error) {
      showNotification('Error viewing document: ' + error.message, 'error');
    }
  };

  return (
    <motion.div 
      className="documents-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Secure Document Management</h2>
      
      <div className="upload-section">
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <FiUpload /> Choose File
          </label>
          {file && (
            <div className="selected-file">
              <FiFile className="file-icon" />
              <span className="file-name">{file.name}</span>
              <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}
        </div>
        <button 
          onClick={uploadDocument} 
          disabled={uploading || !file}
          className={`upload-button ${!file ? 'disabled' : ''}`}
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Uploading & Verifying...
            </>
          ) : (
            <>
              <FiUpload /> Upload & Verify
            </>
          )}
        </button>
      </div>

      {notification.show && (
        <motion.div 
          className={`notification ${notification.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="documents-list">
        <h3>Your Documents</h3>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <motion.div 
              key={doc.name}
              className="document-item"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FiFile className="document-icon" />
              <span className="document-name">{doc.name}</span>
              <div className="document-actions">
                <button 
                  onClick={() => verifyDocument(doc)}
                  className="action-button verify"
                  title="Verify Document"
                >
                  <FiLock />
                </button>
                <button 
                  onClick={() => viewDocument(doc.name, doc.url)}
                  className="action-button view"
                  title="View Document"
                >
                  <FiEye />
                </button>
                <button 
                  onClick={() => downloadDocument(doc.name)}
                  className="action-button download"
                  title="Download Document"
                >
                  <FiDownload />
                </button>
                <button 
                  onClick={() => deleteDocument(doc.name)}
                  className="action-button delete"
                  title="Delete Document"
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default Documents;
