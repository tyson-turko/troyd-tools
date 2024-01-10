// Require express and body-parser

const axios = require('axios')
const bodyParser = require("body-parser")
const fs = require('fs')
const fsExtra = require('fs-extra');

const ffmpeg = require('ffmpeg');
const tesseract = require("node-tesseract-ocr");
// Initialize express and define a port

/* Express Stuff */


const express = require("express")
const app = express()
const PORT = 3000

const routes = require('./src/routes/api'); 


app.use(express.json());
app.use('/', routes); //to use the routes

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

/* const Discord = require('discord.js')
const DiscordToken = "MTQxNzE0NjkwNDc5NzUxMTY5.XXugOQ.b5lIzrh6wV8vBLDxcYlYoh_AYkI"
const client = new Discord.Client() */


const twitchAppClientID = 'oe7dfk1ar1tgh3f19gou6sw7kcskuf';
const twitchAppSecret = '70yh810aoychwzpxn17xfx01csvmq8';



const gameRegistry = ['mechabellum','coh3'];


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
9. Delete source video

*/



//ffmpeg  -i "video.mp4" -r 1 -loop 1 -i image.png -an -filter_complex "blend=difference:shortest=1,blackframe=90:32" -f null -     matches or an image

function parseVideo(){

  var exec = require('child_process').exec;
  var __dir = 'assets/videos/';
  var file = 'video2.mp4';


  fsExtra.emptyDirSync('assets/img/frames');
  var cmd = 'ffmpeg -i "'+__dir+file+'" -q:v 1 -vf format=gray,fps=0.33333,lutyuv="y=negval:u=negval:v=negval" assets/img/frames/%06d.jpg';
  //var cmd = 'ffmpeg -i videos/videotest.mp4 -vf "fps=0.5" -q:v 1 -vf format=gray img/frames/%d.jpg';

  exec(cmd, function(err, stdout, stderr) {
    if (err) console.log('err:\n' + err);
    if (stderr) console.log('stderr:\n' + stderr);
    console.log('stdout:\n' + stdout);
});
  console.log('I am finished?');


}


async function parseSingleImageText(filename)
{


  const config = {
    lang: "eng",
    //psm: 5,
    oem: 3
  }

  //const rectangle =  { left: 399, top: 300, width: 1100, height: 550 };
  //const rectangle =  { left: 399, top: 380, width: 478, height: 133 };
  const rectangle = { left: 0, top: 0, width: 500, height: 250 };

  var result = await tesseract
  .recognize("assets/img/frames/"+filename, {  })
  .then((text) => {
   console.log("\n\nResult from: "+filename, text)

    //check for text, build out match model
 
    if(text.includes("VICTORY")){
      console.log('Found Battle End in file:');
      
      return;
      }
    return false;
    //console.log(text);

  })
  
  .catch((error) => {
    console.log(error.message)
  })

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

var matchObjects = [];



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

        if(!matchActiveStatus)
        {
      
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
            return;
            }
            

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




var testMatches = [{
  number: 1,
  frame_start: 1338,
  frame_end: 2295,
  map: 'Shipyard Compact',
  victory: true,
},
{
  number: 2,
  frame_start: 2331,
  frame_end: 4002,
  map: 'Shipyard Compact',
  victory: true,
},
{
  number: 3,
  frame_start: 4080,
  frame_end: 5490,
  map: 'Shipyard Compact',
  victory: true,
},
{
  number: 4,
  frame_start: 5529,
  frame_end: 7065,
  map: 'Shipyard Compact',
  victory: false,
},
{
  number: 5,
  frame_start: 7161,
  frame_end: 8358,
  map: 'Shipyard Compact',
  victory: false,
},
{
  number: 6,
  frame_start: 8385,
  frame_end: 10303,
  map: 'Shipyard Compact',
  victory: true,
}
]


function cutVideos(matchObjects)
{

  matchObjects.forEach(function (match,index) {


      var start = new Date((match.frame_start-1)  * 1000).toISOString().substring(11, 19);
      var end = new Date((match.frame_end)  * 1000).toISOString().substring(11, 19);
    
      console.log(start,end);
    
      var __dir = 'assets/videos/';
    
      var cmd = 'ffmpeg -ss '+start+' -to '+end+' -i '+__dir+'video2.mp4 -c copy '+__dir+'output_'+index+'.mp4';
      //var cmd = 'ffmpeg -i videos/videotest.mp4 -vf "fps=0.5" -q:v 1 -vf format=gray img/frames/%d.jpg';
      var exec = require('child_process').exec;
      exec(cmd, function(err, stdout, stderr) {
        if (err) console.log('err:\n' + err);
        if (stderr) console.log('stderr:\n' + stderr);
        console.log('stdout:\n' + stdout); 
        });
    

    
  });

  
    console.log('Finished Cutting All Matches');


}





cutVideos(testMatches);
//parseVideo();
//parseProcessedImagesMechabellumStart();
//parseSingleImageText('000406.jpg');

