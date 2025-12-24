<img src="https://img.icons8.com/clouds/2x/book.png" width="300">

# book-lib
- Static web app that uses a [Github Repository](https://github.com/shivam1410/books/) as a database, enabled by [Github APIs](https://developer.github.com/v3/git/trees/).
- Hosted on [GitHub Pages](https://shivam1410.github.io/book-lib/)

## Features
- Browse books organized in folders
- Navigate through directory structure
- Direct links to view/download files
- Modern, responsive UI
- Client-side rendering using GitHub API

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/shivam1410/book-lib.git
cd book-lib
```

2. Install dependencies (optional, for local server):
```bash
npm install
```

3. Run a local server:
```bash
npm start
```

Or use any static file server like:
```bash
python -m http.server 8000
# or
npx serve .
```

## Deployment to GitHub Pages

### Option 1: Automatic Deployment (Recommended)
The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

1. Make sure your repository has GitHub Pages enabled:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source

2. Push your code to the main branch:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

3. The GitHub Action will automatically build and deploy your site.

### Option 2: Manual Deployment
1. Go to your repository Settings → Pages
2. Select the branch (main/master) and folder (root or /docs)
3. Click Save

## Resources
- [Github Book repository](https://github.com/shivam1410/books/)
- [Github APIs](https://developer.github.com/v3/git/trees/)

## Migration from Heroku
This application was previously hosted on Heroku as a Node.js/Express server. It has been converted to a static site for GitHub Pages hosting:
- Server-side Express code converted to client-side JavaScript
- No backend dependencies required
- Uses GitHub API directly from the browser
- Free hosting on GitHub Pages

## Contribution
This project was created to test Github APIs and explore using a GitHub repository as a database. The [Github Book repository](https://github.com/shivam1410/books/) serves as the data source for this application. 
