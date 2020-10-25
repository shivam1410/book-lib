const axios = require('axios');
const express = require('express');

const hostname = 'https://books-col.herokuapp.com/';
const appBaseURL = `${hostname}`;
const githubRepoURL = `https://github.com/shivam1410/books`;

const app = express();

function createFullHTML(directory, baseUrl) {

    let directory_list_html = createDirList(directory, baseUrl);

    let full_html = `<!doctype html><html lang="en"><head><title>Hello, world!</title></head>
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
            let queryString = new URLSearchParams(query).toString();
            if(type != "blob"){
                temp += `<li><a href="${appBaseURL}/url?${queryString}"> ${path} </a></li>`;
            } else{
                temp += `<li><a href="${githubRepoURL}/blob/master${base_path}/${path}"> ${path} </a></li>`;
            }
        }
    }
    return temp + `</ul></div>`;
}


app.listen(hostname, () => {
  console.log(`Server running at ${appBaseURL}`);
});

