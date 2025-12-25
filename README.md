<img src="https://img.icons8.com/clouds/2x/book.png" width="300">

# book-lib

A static web application that uses a GitHub repository as a database to browse and view books. The app is hosted on GitHub Pages and uses GitHub APIs to fetch and display content.

**Live Site:** [https://shivam1410.github.io/book-lib/](https://shivam1410.github.io/book-lib/)

## Features

- 📚 Browse books organized in folders
- 🗂️ Navigate through directory structure with breadcrumbs
- 📄 View PDFs directly in the browser
- 🔍 Modern, responsive UI
- ⚡ Client-side rendering using GitHub API

## GitHub APIs Used as Database

This application uses the following GitHub APIs to fetch repository content:

1. **GitHub Contents API** - `GET /repos/{owner}/{repo}/contents/{path}`
   - Used to fetch directory listings and file metadata
   - Returns file/folder information including name, path, type, and download URLs
   - API Documentation: [GitHub Contents API](https://docs.github.com/en/rest/repos/contents)

2. **GitHub Raw Content URLs** - `https://github.com/{owner}/{repo}/raw/{branch}/{path}`
   - Used to access raw file content (PDFs, documents, etc.)
   - Direct links to files for viewing and downloading

The app uses the [books repository](https://github.com/shivam1410/books/) as its data source, treating the repository structure as a database.

## PDF Rendering

PDFs are rendered using:

1. **Google Docs Viewer** (Primary)
   - Embeds PDFs via Google's viewer service: `https://docs.google.com/viewer?url={pdfUrl}&embedded=true`
   - Works reliably with GitHub raw URLs
   - Provides a clean, embedded viewing experience

2. **Browser Native PDF Viewer** (Fallback)
   - Uses HTML `<object>` and `<embed>` tags
   - Falls back if Google Docs Viewer fails
   - Uses the browser's built-in PDF rendering capabilities

## Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/shivam1410/book-lib.git
cd book-lib
```

2. **Install dependencies (optional, for local server):**
```bash
npm install
```

3. **Run a local server:**
```bash
npm start
```

This will start a local server (usually on `http://localhost:3000`). Navigate to `http://localhost:3000/book-lib/` to view the application.

**Alternative:** You can use any static file server:
```bash
python -m http.server 8000
# or
npx serve . -s
```

## Deployment to GitHub Pages

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

### Setup Steps:

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select "GitHub Actions" as the source

2. **Push your code:**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

3. **Wait for deployment:**
   - The GitHub Action will automatically build and deploy your site
   - Your site will be available at: `https://{username}.github.io/book-lib/`

The workflow file (`.github/workflows/static.yml`) handles the deployment automatically.

## Resources

- **Data Source:** [Github Books Repository](https://github.com/shivam1410/books/)
- **GitHub Contents API:** [API Documentation](https://docs.github.com/en/rest/repos/contents)
- **GitHub Pages:** [Documentation](https://docs.github.com/en/pages)

## Contribution

This project was created to explore using GitHub APIs and demonstrate how a GitHub repository can serve as a database for a static web application. The [Github Books repository](https://github.com/shivam1410/books/) serves as the data source for this application.
