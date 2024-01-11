// Require express and body-parser

const axios = require('axios')
const bodyParser = require("body-parser")
const fs = require('fs')
const fsExtra = require('fs-extra');
require('dotenv').config();
const sharp = require('sharp');
const ffmpeg = require('ffmpeg');
//const tesseract = require("node-tesseract-ocr");
const tesseract = require('tesseract.js');
// Initialize express and define a port

/* Express Stuff */


const express = require("express")
const app = express()
const PORT = 3000


/** Controllers **/

const routes = require('./src/routes/api'); 


app.use(express.json());
app.use('/', routes); //to use the routes

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

/* const Discord = require('discord.js')
const DiscordToken = process.env.DiscodToken;
const client = new Discord.Client() */



const gameRegistry = ['mechabellum','coh3'];

const coh3 = require("./src/methods/coh3.js");
const video = require("./src/methods/video.js");
const youtube = require("./src/methods/youtube.js");
const { stringify } = require('querystring');

youtube.test();


/////// 

/*
      
Input is Stream, Output is Match Videos 

1. detect that a stream file is present and not processed, get frame rate
2. Parse data dump from OBS to detect what game is liklely in the stream

3. PreProcess into images every n seconds, gray scale inverted.
4. Detect Start and End point of each game
5. Create video file for each

6. Copyright free (music?) overlaid.
7. Generate Thumbnail
8. Upload Funcationality for Youtube, Twitch & Kick?
9. Delete source video, move files to a queue folder

*/


const videoObject = {

  title: 'test',
  description: 'Test test test',
  tags:['test','test','test4'],
  videoFilePath:'assets/videos/output_0.mp4',
  thumbFilePath:'assets/videos/output_0_true_thumbnail_raw.png',
  publish_at: null,

};

//workFlow
  
      //get filename = 'CoH3 2v2 _ Ranked Matches 2024-01-04.mp';
      // video.parseVideo('CoH3 2v2 _ Ranked Matches 2024-01-04.mp4');  

      // Cut my videos and collect information
     /*  var result =   coh3.identifyMatchesFromStreamImages().then(function(result){
        video.cutMatchVideos(result,'CoH3 2v2 _ Ranked Matches 2024-01-04.mp4');
        //coh3.modifyThumbnails();
      }); */


    //  console.log('Function did not wait', result);
     // 
      //console.log('On thingy');
      //youtube.uploadVideo(videoObject)
      coh3.uploadVideostoYoutube();

 //   parseSingleImageText('000048.jpg');

//ffmpeg  -i "video.mp4" -r 1 -loop 1 -i image.png -an -filter_complex "blend=difference:shortest=1,blackframe=90:32" -f null -     matches or an image

async function parseSingleImageText(filename)
{


  const { createWorker } = require('tesseract.js');

  const worker = await createWorker('eng');
  //coh3 rectangles
  const rectangle = { left: 400, top: 40, width: 251, height: 108 };  // Team 1
  //const rectangle2 = { left: 769, top: 45, width: 251, height: 108 };  // Team 2
  //const rectangle = { left: 524, top: 224, width: 236, height: 30 };  // Team 2
  
  var result = await (async () => {
    const { data: { text } } = await worker.recognize('assets/img/frames/'+filename, { rectangle }); // has to be called rectangle
    console.log(text.split('\n'));

      

    console.log(team1);


    
    await worker.terminate();
  })();

  console.log(result);


  
}

const MechabellumMapList = [];

var matchActiveStatus = false; 
var matchObjectDefault = {
    number: 0,
    frame_start: null,
    frame_end:null,
    map: null,
    victory: false,   
}
const matchProcessingSettings = {
  minimumFramesBeforeStateSwitch: 5,
}



async function parseProcessedImagesMechabellumStart()   ///Mechabellum Prototype
{

  const dir = fs.opendirSync('assets/img/frames')

  const config = {
    lang: "eng",
    psm: 3

  }

  console.log('Starting Processing of Frames Folder');

    let dirent
    while ((dirent = dir.readSync()) !== null) {
    

      const result = await tesseract
     
      .recognize("assets/img/frames/"+dirent.name, config)
      .then((text) => {

       var frameCount = Math.floor(parseFloat(dirent.name.replace(/\.[^/.]+$/, ""))/0.3333);

      
      
          if(text.includes("BATTLE STARTING")){

            matchObject = {
                  number: 0,
                  frame_start: null,
                  frame_end:null,

                  map: null,
                  victory: false,   
                  players:[{name:'Troyd'}]
              };

            matchObject.number = matchObjects.length + 1;
            matchActiveStatus = true;
            matchObject.frame_start = frameCount;          
            matchObject.map = 'Shipyard Compact';

            

            console.log('Found Battle Start in file: '+dirent.name, matchObject);
         
            }
        

        if(matchActiveStatus && (frameCount >= matchObject.frame_start + matchProcessingSettings.minimumFramesBeforeStateSwitch))
        {

          if(text.includes("SAVE REPLAY")){
            
            matchActiveStatus = false;
            matchObject.frame_end = frameCount;  
            if(text.includes("VICTORY")) matchObject.victory = true;
           
            matchObjects.push(matchObject);
            console.log('Found Battle End in file: '+dirent.name,matchObject);
            return;
            }    

          
          

        }  
          console.log('Processed: '+dirent.name, matchActiveStatus);
          return null;

      })
      .catch((error) => {
        console.log(error.message)
      })

      //console.log(result);
  
    }

    console.log('This is after the processing is complete');
    console.log(matchObjects);
    dir.closeSync();
    return matchObjects;


}




var matchObjects = [{
  number: 1,
  filename_start: '000039.jpg',
  frame_start: 117,
  frame_end: 2510,
  map: 'pachind farmlands',
  victory: true,
  team1: [
    { rank: '#599', elo: '1222', name: 'Troyd' },
    { rank: '#491', elo: '1225', name: '=Clownface' }
  ],
  team2: [
    { rank: '#526', elo: '1282', name: 'Kpen' },
    { rank: '#770', elo: 'mas', name: 'SteelRain' }
  ]
},{
  number: 2,
  filename_start: '000909.jpg',
  frame_start: 2727,
  frame_end: 4787,
  map: 'jil ena nt',
  victory: false,
  team1: [
    { rank: 'mag5', elo: '1255', name: 'Troyd' },
    { rank: '#553', elo: '1204', name: 'CLARK' }
  ],
  team2: [
    { rank: '#401', elo: '1279', name: 'UncleClappy' },
    { rank: '#810', elo: '1174', name: 'espitaon' }
  ]
},
{
  number: 3,
  filename_start: '001624.jpg',
  frame_start: 4872,
  frame_end: 6323,
  map: 'torrente',
  victory: true,
  team1: [
    { rank: '#5a1', elo: '1239', name: 'Troyd' },
    { rank: '#4181278', elo: 'HankManly', name: '.' }
  ],
  team2: [
    { rank: '#372', elo: '1261', name: 'John' },
    { rank: '#686', elo: 'mes', name: 'SunkCost' }
  ]
}
]


function thumbnailCreationMechaBellum()
{
  var __dirOutput = 'assets/videos/';

  
  const dir = fs.opendirSync(__dirOutput)
  let dirent
  while ((dirent = dir.readSync()) !== null) {
    if(dirent.name.includes('raw'))
    {
       sharp('assets/videos/'+dirent.name)
      .extract({ left: 410, top: 315, width: 1100, height: 580 })
      .resize(1280,720)
      .toFile("assets/videos/"+dirent.name.replace(/\.[^/.]+$/, "").replace('_raw','')+".png")
      .then(() => {
        console.log(dirent);
        //    fs.unlink('assets/videos/'+dirent.name);
      });
    }
  }
  dir.closeSync()
    

}




filename = "2024-01-10.mp4";

//parseVideo(filename);  // on complete rn next two commands

//var parsedMatchObjects = parseProcessedImagesMechabellumStart();
//cutVideos(parsedMatchObjects,filename);
//thumbnailCreationMechaBellum();
