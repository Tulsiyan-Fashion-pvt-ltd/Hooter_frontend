import { useState, useEffect } from 'react';
import styles from '../css/pages/add-bulk-catalog.module.css';
import useCatalogForm from '../hooks/useCatalogForm';
import CatalogSelector from '../components/CatalogSelector';

const route = import.meta.env.VITE_BASEAPI;

export default function AddBulkCatalog(){
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [sessionValid, setSessionValid] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
    const [errorMessage, setErrorMessage] = useState('');
    const [errorFile, setErrorFile] = useState(null);

    // Use the catalog form hook for cascade dropdowns
    const {
        selectedNiche,
        selectedSubNiche,
        selectedCategory,
        selectedType,
        nicheOptions,
        subNicheOptions,
        categoryOptions,
        productTypeOptions,
        handleNicheChange,
        handleSubNicheChange,
        handleCategoryChange,
        handleTypeChange,
        loading: catalogLoading,
    } = useCatalogForm();

    // Verify session on component load
    useEffect(() => {
        async function verifySession() {
            try {
                const response = await fetch(`${route}/session`, {
                    credentials: 'include'
                });
                if (response.status !== 200) {
                    setSessionValid(false);
                    setErrorMessage('Your session has expired. Please log in again.');
                    setUploadStatus('error');
                }
            } catch (error) {
                console.error('Session check error:', error);
            }
        }

        verifySession();
    }, []);

    // Save selected product type to localStorage when it changes
    useEffect(() => {
        if (selectedType) {
            localStorage.setItem('selectedProductTypeId', selectedType);
        }
    }, [selectedType]);

    // Download Excel template
    const handleDownloadTemplate = async () => {
        if (!selectedType) {
            setErrorMessage('Please select a product type first');
            setUploadStatus('error');
            return;
        }

        if (!sessionValid) {
            setErrorMessage('Your session has expired. Please log in again.');
            setUploadStatus('error');
            return;
        }

        try {
            setUploadLoading(true);
            const response = await fetch(
                `${route}/catalog/bulk-excel-sheet?type=${selectedType}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', errorText);
                
                // Check if user is not logged in
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.status === 'user is not logged in') {
                        setSessionValid(false);
                        setErrorMessage('Your session has expired. Please log in again.');
                        setUploadStatus('error');
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 2000);
                        return;
                    }
                } catch (e) {
                    // Response is not JSON, continue with original error
                }
                
                throw new Error(`Failed to download template: ${response.statusText}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk_upload_template_${selectedType}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            setErrorMessage('');
            setUploadStatus(null);
        } catch (error) {
            console.error('Download error:', error);
            setErrorMessage(error.message || 'Failed to download template');
            setUploadStatus('error');
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setErrorMessage('Please select a valid Excel file (.xlsx or .xls)');
                setUploadStatus('error');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setErrorMessage('');
            setUploadStatus(null);
        }
    };

    // Upload bulk catalog
    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMessage('Please select a file to upload');
            setUploadStatus('error');
            return;
        }

        if (!selectedType) {
            setErrorMessage('Please select a product type first');
            setUploadStatus('error');
            return;
        }

        if (!sessionValid) {
            setErrorMessage('Your session has expired. Please log in again.');
            setUploadStatus('error');
            return;
        }

        try {
            setUploadLoading(true);
            const formData = new FormData();
            formData.append('sheet', selectedFile);
            formData.append('type', selectedType);

            const response = await fetch(
                `${route}/catalog/bulk-catalog`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            );

            // Check if user is not logged in
            if (response.status === 401 || response.statusText === 'Unauthorized') {
                setSessionValid(false);
                setErrorMessage('Your session has expired. Please log in again.');
                setUploadStatus('error');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            const data = await response.json().catch(() => ({}));

            // Check for "user is not logged in" in response
            if (data.status === 'user is not logged in') {
                setSessionValid(false);
                setErrorMessage('Your session has expired. Please log in again.');
                setUploadStatus('error');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            if (response.ok && response.status === 200) {
                setUploadStatus('success');
                setErrorMessage('Bulk catalog uploaded successfully!');
                setSelectedFile(null);
                setErrorFile(null);
                setFileInputKey(prev => prev + 1); // Reset file input
            } else if (response.status === 422) {
                // Check if response contains error file
                if (data instanceof Blob || response.headers.get('content-type')?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                    // Error file provided
                    setErrorFile(response);
                    setErrorMessage('Some rows have errors. Download the error file to see which rows failed.');
                    setUploadStatus('error');
                } else if (data.msg) {
                    setErrorMessage(data.msg);
                    setUploadStatus('error');
                } else {
                    setErrorMessage('Validation error: Please check your data and try again');
                    setUploadStatus('error');
                }
            } else {
                setErrorMessage(data.msg || 'Upload failed. Please try again.');
                setUploadStatus('error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage(error.message || 'An error occurred during upload');
            setUploadStatus('error');
        } finally {
            setUploadLoading(false);
        }
    };

    // Download error file
    const handleDownloadErrorFile = async () => {
        if (!errorFile) return;

        try {
            const blob = await errorFile.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk_upload_errors_${selectedType}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading error file:', error);
        }
    };

    // Save as draft (for future implementation)
    const handleSaveDraft = async () => {
        if (!selectedFile) {
            setErrorMessage('Please select a file to save');
            setUploadStatus('error');
            return;
        }
        // Future implementation: Save to drafts
        console.log('Save as draft:', selectedFile);
    };

    return(
        <div className={styles.bulkCatalogContainer}>
            <div className={styles.main}>
                <header>
                    <div className={styles.topContainer}>
                        <h1 className={styles.title}>Add bulk catalog</h1>

                        <p className={styles.subtitle}>
                            Add the product details through an Excel file and we will process them for you
                        </p>

                        <a href="/add-product" className={styles.link}>
                            Add product details individually
                        </a>

                        {/* Steps Section */}
                        <div className={styles.row}>
                            <div className={styles.steps}>
                                <div className={`${styles.step} ${!selectedType ? styles.active : ''}`}>
                                    {selectedType ? (
                                        <span className={styles.check}>✔</span>
                                    ) : (
                                        <span>1&nbsp;</span>
                                    )}
                                    Select Category
                                </div>
                                <div className={`${styles.step} ${selectedType ? styles.active : ''}`}>
                                    <span>2&nbsp;</span>
                                    Upload & Process
                                </div>
                            </div>
                        </div>

                        {/* Cascade Dropdowns */}
                        <CatalogSelector
                            selectedNiche={selectedNiche}
                            selectedSubNiche={selectedSubNiche}
                            selectedCategory={selectedCategory}
                            selectedType={selectedType}
                            nicheOptions={nicheOptions}
                            subNicheOptions={subNicheOptions}
                            categoryOptions={categoryOptions}
                            productTypeOptions={productTypeOptions}
                            handleNicheChange={handleNicheChange}
                            handleSubNicheChange={handleSubNicheChange}
                            handleCategoryChange={handleCategoryChange}
                            handleTypeChange={handleTypeChange}
                            styles={styles}
                        />

                        <div className={styles["mandatory-row"]}>
                            <p className={styles.mandatory}>
                                Mandatory Fields<span>*</span>
                            </p>

                            <div className={`${styles.guideline} ${styles.small}`}>
                                <a href="#">⚠ Follow guidelines to reduce quality check failures</a>
                            </div>
                        </div>

                        <hr className={styles.hr1} />
                    </div>
                </header>

                {catalogLoading && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        Loading categories...
                    </div>
                )}

                {/* STEP 2: Upload & Process - Show when product type is selected */}
                {selectedType && !catalogLoading && (
                    <>
                        <div className={styles.uploadSection}>
                            <label htmlFor="file-upload" className={styles.uploadBtn}>
                                {uploadLoading ? 'Processing...' : 'Upload Excel File'}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                key={fileInputKey}
                                style={{ display: 'none' }}
                                disabled={uploadLoading}
                            />

                            <div className={styles.uploadInfo}>
                                <p>
                                    Please fill all the Mandatory{" "}
                                    <span className={styles.required}>*</span> fields
                                </p>
                                <button 
                                    onClick={handleDownloadTemplate}
                                    disabled={uploadLoading}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#007bff',
                                        cursor: uploadLoading ? 'not-allowed' : 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {uploadLoading ? 'Downloading...' : 'Download Sample Excel File'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.mainContainer}>
                            {/* LEFT BIG SECTION */}
                            <div className={styles.leftSection}>
                                <h2 className={styles.leftHeading}>Upload & Process</h2>

                                <hr className={styles.hr2} />

                                {selectedFile && (
                                    <div className={styles.fileInfo} style={{
                                        padding: '12px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        borderLeft: '4px solid #4caf50'
                                    }}>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                                            ✓ File selected: {selectedFile.name}
                                        </p>
                                        <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                                            Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                )}

                                {uploadStatus === 'error' && (
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#ffebee',
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        borderLeft: '4px solid #f44336'
                                    }}>
                                        <p style={{ margin: '0', color: '#c62828' }}>
                                            ⚠ {errorMessage}
                                        </p>
                                        {errorFile && (
                                            <button
                                                onClick={handleDownloadErrorFile}
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9em'
                                                }}
                                            >
                                                Download Error Report
                                            </button>
                                        )}
                                    </div>
                                )}

                                {uploadStatus === 'success' && (
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        borderLeft: '4px solid #4caf50'
                                    }}>
                                        <p style={{ margin: '0', color: '#2e7d32', fontWeight: '500' }}>
                                            ✓ {errorMessage}
                                        </p>
                                    </div>
                                )}

                                <div className={styles.copyBox}>
                                    <input type="checkbox" id="copy" disabled />
                                    <label htmlFor="copy" style={{ opacity: 0.6 }}>
                                        Copy input details to all products
                                        <br />
                                        <small>
                                            If you want to change specific fields for particular product like Color, Fabric etc
                                        </small>
                                    </label>
                                </div>

                                <div className={styles.buttonRow}>
                                    <button 
                                        className={styles.draft}
                                        onClick={handleSaveDraft}
                                        disabled={uploadLoading || !selectedFile}
                                    >
                                        Save as draft
                                    </button>
                                    <button 
                                        className={styles.submit}
                                        onClick={handleUpload}
                                        disabled={uploadLoading || !selectedFile}
                                    >
                                        {uploadLoading ? 'Uploading...' : 'Submit'}
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT SIDE COLUMN */}
                            <div className={styles.rightSection}>
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1em' }}>Upload Status</h3>
                                    <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                                        {!selectedFile ? 'No file selected' : `File: ${selectedFile.name}`}
                                    </p>
                                    <p style={{ margin: '0', fontSize: '0.9em', color: '#999' }}>
                                        Select an Excel file and click Submit to upload your bulk catalog
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}