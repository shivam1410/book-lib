const githubRepoURL = 'https://github.com/shivam1410/books';
const githubRawBaseURL = `${githubRepoURL}/raw/master`;

let currentPath = '';
let pathHistory = [];

// Helper function to extract the folder path from URL
// This extracts the actual folder path that should be used in GitHub API
function extractPathFromUrl(urlPath) {
    if (!urlPath || urlPath === '/') return '';
    
    // Remove leading slash and decode
    let path = decodeURIComponent(urlPath.substring(1));
    
    // Remove 'index.html' if present
    if (path.endsWith('index.html')) {
        path = path.replace(/index\.html$/, '').replace(/\/$/, '');
    }
    
    // Split into parts and filter out empty strings
    const parts = path.split('/').filter(p => p && p !== 'index.html');
    
    if (parts.length === 0) return '';
    
    // For GitHub Pages: if repo name 'book-lib' is in the path, remove it
    // The folder path starts after the repo name
    if (parts[0] === 'book-lib') {
        // Remove repo name, return the rest as folder path
        return parts.slice(1).join('/');
    }
    
    // No repo name in path, all parts are the folder path
    return parts.join('/');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Handle redirect from 404.html
    if (sessionStorage.redirect) {
        try {
            const redirectUrl = new URL(sessionStorage.redirect);
            const redirectPath = redirectUrl.pathname;
            console.log('Redirect URL:', redirectUrl.href);
            console.log('Redirect pathname:', redirectPath);
            
            sessionStorage.removeItem('redirect');
            const path = extractPathFromUrl(redirectPath);
            
            console.log('Extracted path from redirect:', path);
            loadDirectory(path);
        } catch (e) {
            console.error('Error parsing redirect URL:', e, sessionStorage.redirect);
            loadDirectory('');
        }
    } else {
        // Get initial path from current URL
        const initialPath = extractPathFromUrl(window.location.pathname);
        console.log('Initial path from URL:', initialPath, 'from pathname:', window.location.pathname);
        loadDirectory(initialPath);
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            currentPath = e.state.path || '';
            pathHistory = e.state.history || [];
            loadDirectory(currentPath);
        } else {
            // Handle direct URL navigation
            const path = extractPathFromUrl(window.location.pathname);
            loadDirectory(path);
        }
    });
});

async function loadDirectory(path = '') {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('content');
    const breadcrumbEl = document.getElementById('breadcrumb');
    const breadcrumbPathEl = document.getElementById('breadcrumb-path');
    
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    contentEl.innerHTML = '';
    
    try {
        // Use GitHub Contents API to directly fetch the contents of a specific folder
        // Format: https://api.github.com/repos/shivam1410/books/contents/{folder-path}
        let contentsUrl = 'https://api.github.com/repos/shivam1410/books/contents';
        
        if (path) {
            // Encode each path segment separately for the API
            // Example: "folder1/folder2" -> "folder1/folder2" (each segment encoded)
            const pathSegments = path.split('/')
                .filter(p => p) // Remove empty segments
                .map(segment => encodeURIComponent(segment)); // Encode each segment
            
            if (pathSegments.length > 0) {
                contentsUrl += '/' + pathSegments.join('/');
            }
        }
        
        console.log('Loading directory - extracted path:', path);
        console.log('GitHub API URL:', contentsUrl);
        
        const response = await fetch(contentsUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}. Path: ${path}`);
        }
        
        const directory = await response.json();
        
        // Convert Contents API format to tree format for compatibility
        // Contents API returns: { name, path, type, download_url, ... }
        // We need: { path, type, url (for trees) }
        const formattedDirectory = directory.map(item => {
            // Skip hidden files/folders
            if (item.name[0] === '.') return null;
            
            return {
                path: item.path,
                name: item.name,
                type: item.type === 'dir' ? 'tree' : 'blob',
                size: item.size,
                download_url: item.download_url
            };
        }).filter(item => item !== null);
        
        // Update breadcrumb
        if (path) {
            const pathParts = path.split('/').filter(p => p);
            let breadcrumbHTML = '';
            let currentBreadcrumbPath = '';
            
            pathParts.forEach((part, index) => {
                currentBreadcrumbPath += '/' + part;
                breadcrumbHTML += ` / <a href="#" onclick="navigateToPath('${currentBreadcrumbPath}'); return false;">${part}</a>`;
            });
            
            breadcrumbPathEl.innerHTML = breadcrumbHTML;
            breadcrumbEl.style.display = 'block';
        } else {
            breadcrumbEl.style.display = 'none';
        }
        
        // Render directory
        const html = createDirList(formattedDirectory, path);
        contentEl.innerHTML = html;
        loadingEl.style.display = 'none';
        
        // Update URL without reloading
        // Encode each path segment for the URL
        const urlPath = path ? '/' + path.split('/').map(segment => encodeURIComponent(segment)).join('/') : '/';
        window.history.pushState({ path: path, history: [...pathHistory, path] }, '', urlPath);
        currentPath = path;
        
    } catch (error) {
        console.error('Error loading directory:', error);
        loadingEl.style.display = 'none';
        
        // Provide more helpful error messages
        let errorMessage = `Error: ${error.message}`;
        if (error.message.includes('404')) {
            errorMessage = `Folder not found: "${path}". Please check the path and try again.`;
        } else if (error.message.includes('403')) {
            errorMessage = `Access denied. The repository might be private or rate-limited.`;
        }
        
        errorEl.textContent = errorMessage;
        errorEl.style.display = 'block';
    }
}

function navigateToPath(path) {
    pathHistory.push(currentPath);
    loadDirectory(path);
}

function createDirList(directory = [], basePath = '') {
    if (directory.length === 0) {
        return '<p>No items found in this directory.</p>';
    }
    
    let html = '<ul>';
    
    // Sort: directories first, then files
    const sorted = [...directory].sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.path.localeCompare(b.path);
    });
    
    for (let i = 0; i < sorted.length; i++) {
        const { path, name, type } = sorted[i];
        
        // Skip hidden files/folders (already filtered, but double-check)
        if (name[0] === '.') continue;
        
        if (type === 'tree') {
            // It's a directory - use the full path from root
            html += `<li><a href="#" onclick="navigateToPath('${path}'); return false;" class="folder-icon">${name}</a></li>`;
        } else {
            // It's a file - use the full path from root
            const fileUrl = `${githubRawBaseURL}/${path}`;
            const isPdf = name.toLowerCase().endsWith('.pdf');
            
            if (isPdf) {
                // For PDFs, open in modal viewer
                html += `<li><a href="#" onclick="openPdfModal('${fileUrl}', '${name.replace(/'/g, "\\'")}'); return false;" class="file-icon">${name}</a></li>`;
            } else {
                // For other files, open in new tab
                html += `<li><a href="${fileUrl}" target="_blank" class="file-icon">${name}</a></li>`;
            }
        }
    }
    
    html += '</ul>';
    return html;
}


// PDF Modal Functions
function openPdfModal(pdfUrl, fileName) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('pdfModalTitle');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const pdfLoading = document.getElementById('pdfLoading');
    const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
    const pdfOpenBtn = document.getElementById('pdfOpenBtn');
    
    // Set modal title
    modalTitle.textContent = fileName;
    
    // Set download and open links
    pdfDownloadBtn.href = pdfUrl;
    pdfOpenBtn.href = pdfUrl;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Hide loading immediately, show viewer
    pdfLoading.style.display = 'none';
    pdfViewerContainer.style.display = 'block';
    
    // Use Google Docs Viewer or browser native viewer via object/embed
    // Google Docs Viewer works well for GitHub raw URLs
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    
    // Try using iframe with Google Viewer first (most reliable)
    pdfViewerContainer.innerHTML = `
        <iframe 
            id="pdfIframe" 
            src="${googleViewerUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border: none; min-height: 600px;"
            onload="document.getElementById('pdfLoading').style.display='none';"
            onerror="fallbackToObjectViewer('${pdfUrl.replace(/'/g, "\\'")}');"
        >
            <p>Your browser does not support iframes. 
            <a href="${pdfUrl}" target="_blank">Click here to open the PDF</a></p>
        </iframe>
    `;
}

function fallbackToObjectViewer(pdfUrl) {
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    // Fallback to object tag with native browser viewer
    pdfViewerContainer.innerHTML = `
        <object 
            data="${pdfUrl}" 
            type="application/pdf" 
            width="100%" 
            height="100%" 
            style="min-height: 600px; border: none;"
        >
            <embed 
                src="${pdfUrl}" 
                type="application/pdf" 
                width="100%" 
                height="100%"
                style="min-height: 600px;"
            />
            <div style="text-align: center; padding: 40px;">
                <p style="margin-bottom: 20px; color: #666;">
                    Unable to display PDF in browser. 
                </p>
                <a href="${pdfUrl}" target="_blank" style="color: #667eea; text-decoration: underline; font-weight: 600;">
                    Click here to open in new tab
                </a>
            </div>
        </object>
    `;
}

// Make fallbackToObjectViewer available globally
window.fallbackToObjectViewer = fallbackToObjectViewer;


function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Clean up
    currentPdfDoc = null;
    currentPageNum = 1;
    totalPages = 0;
    
    // Clear viewer container
    pdfViewerContainer.innerHTML = '';
}

// Close modal when clicking outside the content
document.addEventListener('click', (e) => {
    const modal = document.getElementById('pdfModal');
    if (e.target === modal) {
        closePdfModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('pdfModal');
        if (modal.classList.contains('active')) {
            closePdfModal();
        }
    }
});

// Make functions available globally
window.navigateToPath = navigateToPath;
window.openPdfModal = openPdfModal;
window.closePdfModal = closePdfModal;

