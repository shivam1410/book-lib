// *Depricated* When Served from backend
const axios = require('axios');
const express = require('express');

port = process.env.PORT || 80;
const appBaseURL = 'https://books-col.herokuapp.com';
const githubRepoURL = `https://github.com/shivam1410/books`;

const app = express();

function createFullHTML(directory, baseUrl) {

    let directory_list_html = createDirList(directory, baseUrl);

    let full_html = `<!doctype html><html lang="en"><head><title>Books Library</title></head>
                     <body>${directory_list_html}</body></html>`;
    return new Buffer(full_html);
}

app.get('/', async (req,res)=>{
    
    const repoUrl = `https://api.github.com/repos/shivam1410/books/git/trees/master`;
    const { data } = await axios.get(repoUrl);
    const directory = data.tree;
    
    res.set('Content-Type', 'text/html')
    res.send(createFullHTML(directory, ''))
})

app.get('/url', async (req,res)=>{

    const repoUrl = req.query.redirecturi
    const basePath = req.query.basepath;
    const { data } = await axios.get(repoUrl);
    const directory = data.tree;

    res.set('Content-Type', 'text/html')
    res.send(createFullHTML(directory, basePath))
})

function createDirList(directory = [], base_path = ''){
    var temp = '<div><ul>'
 
    for(var i=0;i<directory.length;i++){
        let { path, url, type }  = directory[i];
        if(path[0] != '.'){
            
            var query = {
                'redirecturi': url,
                'basepath': base_path + '/' + path
            }
            //shivam1410/books/raw/master/Cloud/A%20Complete%20Guide%20to%20Cloud%20Computing.pdf
            let queryString = new URLSearchParams(query).toString();
            if(type != "blob"){
                temp += `<li><a href="${appBaseURL}/url?${queryString}"> ${path} </a></li>`;
            } else{
                temp += `<li><a href="${githubRepoURL}/raw/master${base_path}/${path}"> ${path} </a></li>`;
            }
        }
    }
    return temp + `</ul></div>`;
}


var server = app.listen(port, () => {
  console.log(`Server running at ${appBaseURL}`);
});

