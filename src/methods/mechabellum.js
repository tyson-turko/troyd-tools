
const { createWorker } = require('tesseract.js');
const fs = require('fs')

const sharp = require('sharp');
const { exec } = require("child_process");
const util  = require("util");
const execPromise = util.promisify(exec);

const fsExtra = require('fs-extra');
const youtube = require("./youtube");
const { exit } = require('process');
const { Console } = require('console');



var YoutubeObject = {

    titles: '',
    tags:['mechabellum','mechabellum gameplay','strategy games','mecabellum','mechabellum builds','high mmr mechabellum','autochess'],
    category: 'Gaming',
    game: 'Mechabellum'



}


var mechabellum = {};


const MechabellumMapList = ['Valley Meadow'];

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


mechabellum.prepareVideo = async function(videoFilename){

    return;

    var exec = require('child_process').exec; 
    console.log('Started processing '+videoFilename);    
    fsExtra.emptyDirSync('assets/img/frames');
    // extract a frame every 3 seconds, grayscale and expose to maximize text readability
    var cmd = 'ffmpeg -i "'+process.env.streamVideoDirectory+'/'+videoFilename+'" -q:v 1 -vf format=gray,fps=0.33333,eq=contrast=3:saturation=2 assets/img/frames/%06d.jpg';
    await execWrapper(cmd);    
    return true;  
  
  }


mechabellum.identifyMatchesFromStreamImages = async function()   ///Mechabellum Prototype
{

    return;
    
console.log('Starting MechaBellum Stream Match Processing');

  var matchActiveStatus = false; 
  var battleStartFlag = false;

  const dir = fs.opendirSync('assets/img/frames') 
  
  let matchObjects = [];
  

     console.log('Starting Processing of Frames Folder');

    let dirent
    while ((dirent = dir.readSync()) !== null) {

        console.log('Battle Start',battleStartFlag,'Match Active',matchActiveStatus,)

        var frameCount = Math.floor(parseFloat(dirent.name.replace(/\.[^/.]+$/, ""))/0.3333);       


            if(!matchActiveStatus )  //when outside a match, look for battle starting prompt, collect info. 
            {

                const worker = await createWorker('eng');
                var rectangle = { left: 410, top: 212, width: 459, height: 43 }; /// 720
            
                var result = await (async () => {
                const { data: { text } } = await worker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                //console.log(text);
        
        
                if(text.includes("BATTLE STARTING")){

                       
                    matchObject = {
                        game:'mechabellum',
                        number: 0,
                        filename_start: null,
                        frame_start: null,
                        frame_end:null,        
                        map: null,
                        victory: false,   
                        team1: [],
                        team2: []
                    };
        
                    matchObject.number = matchObjects.length + 1;
                    battleStartFlag = true;
                    matchObject.filename_start = dirent.name;
                    matchObject.frame_start = frameCount;  
                    
                    
                    //** Identify Team 2 **/

                   /*  const Team2Worker = await createWorker('eng');
                    //fetch map name
                    rectangle = { left: 769, top: 45, width: 251, height: 108 }; 
                    (async () => {
                        const { data: { text } } = await Team2Worker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                       
                       
                        text.split('\n').forEach(playerLine => {
                            var playerInfoObject = {};
                            if(playerLine.length > 4){
                                playerInfo = playerLine.split(' ');
                              //  console.log(playerInfo);
        
                                playerInfoObject.rank = playerInfo[0].replace('s',5);
                                playerInfoObject.elo = playerInfo[1];
                                playerInfoObject.name = playerInfo[2];
                                matchObject.team2.push(playerInfoObject);
                            }
                       // console.log(matchObject);
                    });
                        await Team2Worker.terminate();
                    })(); */



                    //** Identify Map  */
                    const MapWorker = await createWorker('eng');
                    //fetch map name
                    rectangle = { left: 551, top: 255, width: 197, height: 38 }; // 720p location of map text in battle screen prompt
                    (async () => {
                        const { data: { text } } = await MapWorker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                        console.log('Map parse attempt');
                        console.log(text);
                        matchObject.map = text.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase();
                        await MapWorker.terminate();
                    })();

                    
                    console.log('Found Battle Start in file: '+dirent.name, matchObject);
                
                    }     
        
                await worker.terminate();
                })();      
           }
          
           if(!matchActiveStatus && battleStartFlag) 
           {

                    const MaatchActiveWorker = await createWorker('eng');
                    //fetch map name
                    Console.log('Trigger 2');
                    rectangle = { left: 373, top: 90, width: 147, height: 34 }; /// First Card Selection Screen
                    (async () => {
                        const { data: { text } } = await MaatchActiveWorker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                        if(text.includes('SELECT'))
                        {                            
                            matchActiveStatus = true;
                        }
                      
                        await MaatchActiveWorker.terminate();
                    })();

           }


           if(typeof matchObject != "undefined" && matchObject.team1.length == 0 && matchActiveStatus && battleStartFlag)
           {                     

                                

                const TeamWorker = await createWorker('eng');
                //fetch map name
                Console.log('Trigger 3');
                rectangle = { left: 79, top: 25, width: 110, height: 19 }; 
                (async () => {
                    const { data: { text } } = await TeamWorker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                    //player 1
                    if(text.includes('Troyd'))
                    {
                        console.log('Found Troyd');
                        var playerInfoObject = {};
                        //playerInfoObject.name = text.replace(/[^\w\s]/gi, '').trim();
                        playerInfoObject.name = 'Troyd';
                        matchObject.team1.push(playerInfoObject);

                       const TeamWorker2 = await createWorker('eng');
                        //fetch map name
                        
                        rectangle = { left: 1067, top: 26, width: 110, height: 20 };  // Player 2 720p
                         Console.log('Trigger 4');
                        (async () => {
                            const { data: { text } } = await TeamWorker2.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                             //player 2
                            var playerInfoObject = {};
                            playerInfoObject.name = text.replace(/[^\w\s]/gi, '').replace('\n','').trim();
                            matchObject.team2.push(playerInfoObject);
                            console.log('player 2',text);
                            console.log(matchObject);
                            await TeamWorker2.terminate();
                        })();

                        
                    } 
                  
                  
                
                    await TeamWorker.terminate();
                })();

                
               



           }



           if(matchActiveStatus)
           {



            const worker = await createWorker('eng');
            rectangle = { left: 523, top: 184, width: 229, height: 52 }; 
            Console.log('Trigger 5');
            var result = await (async () => {
            const { data: { text } } = await worker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle    
    
            if(text.includes("DEFEAT") || text.includes('VICTORY')){
              
                if(text.includes('VICTORY')) matchObject.victory = true;
                
                matchActiveStatus = false;
                battleStartFlag = false;
                matchObject.frame_end = frameCount+5;
                matchObjects.push(matchObject);
    
                console.log('Match End Found: '+dirent.name, matchObject);


            
    
            }        

         
    
            await worker.terminate();
            })();

            


           }
   

        console.log('Processed: '+dirent.name, matchActiveStatus);

 
    }

 
    

    console.log('This is after the processing is complete');
    console.log(matchObjects);
    dir.closeSync();

    var jsonData = JSON.stringify(matchObjects);
    fs.writeFile("assets/videos/matches.json", jsonData, function(err) {
        if(err) console.log(err);           
    });

    return matchObjects;


}





mechabellum.thumbnailCreationMechaBellum = function()
{
  var __dirOutput = 'assets/videos/';

  
  const dir = fs.opendirSync(__dirOutput)
  let dirent
  while ((dirent = dir.readSync()) !== null) {
    console.log(dirent.name);
    if(dirent.name.includes('_raw.png'))
    {
       sharp('assets/videos/'+dirent.name)
      //.extract({ left: 410, top: 315, width: 1100, height: 580 })   // 1080p
      .extract({ left: 274, top: 191, width: 745, height: 387 })   // 720p
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

 
async function execWrapper(cmd) {
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout) {
      console.log(`stderr: ${stdout}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  }



mechabellum.uploadVideostoYoutube = function ()
{
    console.log('Starting Mechabellum Youtube upload');
    const dir = fs.opendirSync('assets/videos')
    let dirent
    while ((dirent = dir.readSync()) !== null) {
       
        if(dirent.name.includes('mp4'))
        {
            const {size} = fs.statSync('assets/videos/'+dirent.name);
            const {ctime} = fs.statSync('assets/videos/'+dirent.name);
            //console.log(ctime);
            //console.log(size);
            let matchInfo = require('../../assets/videos/'+dirent.name.replace(/\.[^/.]+$/, "")+'.json');
            //console.log(matchInfo);
            let matchsize = null;

            let Team1String = '';
            matchInfo.team1.forEach((player,i)=>{
                
                if(i > 0) Team1String = Team1String + ' &'
                Team1String = Team1String + ' '+player.name;
            })

            let Team2String = '';
            matchInfo.team2.forEach((player,i)=>{
                
                if(i > 0) Team2String = Team2String + ' &'
                Team2String = Team2String + ' '+player.name;
            })

            let title = 'Mechabellum '+matchsize+'v'+matchsize+' |'+Team1String+' vs'+Team2String+' on '+matchInfo.map;
            videoObject = {
                
                title: title,
                description: 'Ranked Mechabellum 3 online multiplayer gameplay & matches streamed live by Troyd.     #mechabellum #autochess #strategygames',
                tags: YoutubeObject.tags,
                videoFilePath: 'assets/videos/'+dirent.name,
                thumbFilePath:'assets/videos/'+dirent.name.replace(/\.[^/.]+$/, "")+'_'+matchInfo.victory+'_thumbnail_raw.png',
                publish_at: null,

            }
          //  console.log(videoObject);
            // console.log('Uploading '+dirent.name);
            if( parseInt(size) > 183563089) console.log(size,dirent.name);
            //youtube.uploadVideo(videoObject);

            

        }

    }
    dir.closeSync();
}






module.exports = mechabellum;
