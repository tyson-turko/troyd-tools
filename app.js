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
const mechabellum = require("./src/methods/mechabellum.js");
const video = require("./src/methods/video.js");
const youtube = require("./src/methods/youtube.js");
const { stringify } = require('querystring');
const { Console } = require('console');



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


const videoObject = {  //create a model for this

  title: 'test',
  description: 'Test test test',
  tags:['test','test','test4'],
  videoFilePath:'assets/videos/output_0.mp4',
  thumbFilePath:'assets/videos/output_0_true_thumbnail_raw.png',
  publish_at: null,

};

//workFlow
  
let filename = 'MechaBellum 2v2 Ranked Matches  _  2024-01-11.mp4';

function processCoH3Stream  (filename)
{ 
  video.prepareVideo(filename).then(function(result) //prepares video for processing
     {
      console.log("Starting match identification.")
      var result =   coh3.identifyMatchesFromStreamImages().then(function(result){  //identifies match info
        video.cutMatchVideos(filename,result);    // cuts videos & thumbnail candidates   
      });
      console.log('test');
     });  
}

function processMechaBellumStream (filename)
{
  mechabellum.prepareVideo(filename).then(function(result) //prepares video for processing
  {
   console.log("Starting match identification.")
     var result =   mechabellum.identifyMatchesFromStreamImages().then(function(result){  //identifies match info
        video.cutMatchVideos(filename,result);    // cuts videos & thumbnail candidates   
   }); 
   console.log('test');
  });  
  
}

//processMechaBellumStream(filename);
//mechabellum.thumbnailCreationMechaBellum();
mechabellum.uploadVideostoYoutube();


//parseSingleImageText('003928.jpg');
//processCoH3Stream(filename);

            // job that runs every few hours
                  // coh3.uploadVideostoYoutube();
                //youtube.uploadVideo(videoObject)


 //   parseSingleImageText('000048.jpg');


async function parseSingleImageText(filename)
{


  const { createWorker } = require('tesseract.js');

  const worker = await createWorker('eng');
  //coh3 rectangles
  const rectangle2 = { left: 79, top: 25, width: 110, height: 19 };  // Player 1
  const rectangle = { left: 1067, top: 25, width: 110, height: 19 };  // Player 2
  //const rectangle2 = { left: 769, top: 45, width: 251, height: 108 };  // Team 2
  //const rectangle = { left: 524, top: 224, width: 236, height: 30 };  // Team 2
  
  var result = await (async () => {
    const { data: { text } } = await worker.recognize('assets/img/frames/'+filename, { rectangle }); // has to be called rectangle
   
   console.log(text);
   // console.log(text.split('\n'));

      

   // console.log(team1);


    
    await worker.terminate();
  })();

  console.log(result);


  
}




