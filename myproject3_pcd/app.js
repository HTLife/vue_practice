const express = require("express");
const {spawn} = require('child_process');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

let jsonFileName = "path.json";
let paramsFileName = "params.json";
let processing = false;

function ensureDirSync(dir){
    const {existsSync, statSync, mkdirSync} = require('fs');
    if(existsSync(dir)){
        st = statSync(dir);
        return st.isDirectory();
    }
    else{
        mkdirSync(dir);
        return true;
    }
}

// Ensure directories that are prerequisites of this application.
ensureDirSync('paths');
ensureDirSync('params');

function genFileName(){
    let date = new Date();
    const dateStr = date.getFullYear() + '-' +
        ('00' + (date.getMonth() + 1)).slice(-2) + '-' + ('00' + date.getDate()).slice(-2) + '-' +
        ('00' + date.getHours()).slice(-2) +
        ('00' + date.getMinutes()).slice(-2) +
        ('00' + date.getSeconds()).slice(-2);
    jsonFileName = 'paths/path' + dateStr + '.json';
    paramsFileName = 'params/path' + dateStr + '.json';
    //dt.toFormat("paths/pathYYYY-MM-DD-HH24-MI-SS.json");
    return [jsonFileName, paramsFileName];
}

const server = app.listen(3010, () => {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

app.get("/api/path", function(req, res, next){
    const {readFileSync} = require('fs');
    let fileName = jsonFileName;
    if(req.query.file){
        console.log("path file requested: " + req.query.file);
        fileName = 'paths/' + req.query.file;
    }
    // We could parse the JSON here by `JSON.parse`, but it's no use here.
    const obj = readFileSync(fileName, 'utf8');
    res.send(obj);
});

app.get("/api/param", function(req, res, next){
    const {readFileSync} = require('fs');
    let fileName = paramsFileName;
    if(req.query.file){
        console.log("param file requested: " + req.query.file);
        fileName = 'params/' + req.query.file;
    }
    // We could parse the JSON here by `JSON.parse`, but it's no use here.
    const obj = readFileSync(fileName, 'utf8');
    res.send(obj);
});

app.get("/api/pathlist", function(req, res, next){
    const {readdir, statSync} = require('fs');
    readdir('paths', function(err, files){
        if (err) throw err;
        var fileList = [];
        files.filter(function(file){
            return statSync('paths/' + file).isFile() && /.*\.json$/.test(file); //絞り込み
        }).forEach(function (file) {
            fileList.push(file);
        });
        res.send(fileList);
    });
})

app.post("/api/pathgen", function(req, res, next){
    const {writeFileSync} = require('fs');
    var body = req.body;

    if(processing)
    {
        console.log('Path gen request came in, but I\'m busy now!');
        res.send('busy');
        return;
    }

    const strParams = JSON.stringify(body, null , "  ");

    genFileName();

    writeFileSync(paramsFileName, strParams, 'utf8');

    // We use child_process.spawn rather than child_process.exec because the parameter has
    // an input from the request, which can cause injection vulnerability on the server's console.
    var params = [body.filename, jsonFileName, body.pcdfile,
        body.start[0], body.start[1], body.goal[0], body.goal[1]].concat(body.extents).concat([1]);
    var cmd = './image_to_path_pipe.sh "' + params.join('" "') + '"';
    console.log('running... ' + cmd);

    processing = true;

    let output = "";

    const process = spawn('./image_to_path_pipe.sh', params);
    process.stdin.end(strParams);
    process.on('close', (code) => {
        console.log('done');
        if(code){
            console.log(`Child process returned: ${code}`);
            res.send('fail\n' + output);
        }
        else{
            res.send('ok');
        }
        processing = false;
    });
    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    process.stderr.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
    });

    console.log('exec start');
    // Don't send back here; exec's callback should handle that.
});

app.use(express.static('public'))

