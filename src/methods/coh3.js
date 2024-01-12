const { createWorker } = require('tesseract.js');
const fs = require('fs')
const youtube = require("./youtube");

var coh3 = {};
var matchObjects = [];

var coh3YoutubeObject = {

    titles: '',
    tags:['games','coh3','company of heroes','company of heroes stream','coh stream','coh2','coh3 stream','multiplayer','coh3 wehrmacht','2v2','Company of Heroes','COH','Strategy Games','WW2 Gaming','Real Time Strategy','RTS Gaming','Military Games','Historical Gaming','War Games','Tactical Gaming','coh 3','coh 3 2v2','coh 3 build order','company of heroes 2v2','ww2 games','world war 2 games','company of heroes gameplay','rts gameplay','multiplayer strategy games','Company of heroes 3 multiplayer gameplay'],
    category: 'Gaming',
    game: 'Company of Heroes 3'



}


//coh3 rectangles


        //coh3 rectangles 720p
                // const rectangle = { left: 400, top: 40, width: 251, height: 108 };  // Team 1
                //const rectangle2 = { left: 769, top: 45, width: 251, height: 108 };  // Team 2
                //const rectangle = { left: 524, top: 224, width: 236, height: 30 };  // map on loading screen


                //const rectangle = { left: 981, top: 631, width: 121, height: 43 };  // match end
        //coh3 rectangles 1080p
                

coh3.uploadVideostoYoutube = function ()
{
    const dir = fs.opendirSync('assets/videos')
    let dirent
    while ((dirent = dir.readSync()) !== null) {

        if(dirent.name.includes('mp4'))
        {
            console.log(dirent.name);
            let matchInfo = require('../../assets/videos/'+dirent.name.replace(/\.[^/.]+$/, "")+'.json');
            //console.log(matchInfo);
            let matchsize = matchInfo.team1.length; 

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

            let title = '🍁CoH3 '+matchsize+'v'+matchsize+' |'+Team1String+' vs'+Team2String+' on '+matchInfo.map;
            videoObject = {
                
                title: title,
                description: 'Ranked Company of Heroes 3 Multiplayer matches streamed live by Troyd.     #coh3 #companyofheroes #strategygames',
                tags: coh3YoutubeObject.tags,
                videoFilePath: 'assets/videos/'+dirent.name,
                thumbFilePath:'assets/videos/'+dirent.name.replace(/\.[^/.]+$/, "")+'_'+matchInfo.victory+'_thumbnail_raw.png',
                publish_at: null,

            }
            console.log(videoObject);
            youtube.uploadVideo(videoObject);

            

        }

    }
    dir.closeSync();
}




coh3.identifyMatchesFromStreamImages = async function ()   ///Mechabellum Prototype
{

    console.log('Starting Coh3 Stream Match Processing');

  var matchActiveStatus = false; 

  const dir = fs.opendirSync('assets/img/frames') 
  
  

     console.log('Starting Processing of Frames Folder');

    let dirent
    while ((dirent = dir.readSync()) !== null) {

        var frameCount = Math.floor(parseFloat(dirent.name.replace(/\.[^/.]+$/, ""))/0.3333);

        


            if(!matchActiveStatus)
            {

                const worker = await createWorker('eng');
                var rectangle = { left: 400, top: 40, width: 251, height: 108 }; 
            
                var result = await (async () => {
                const { data: { text } } = await worker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                //console.log(text);
        
        
                if(text.includes("Troyd")){
        
                    matchObject = {
                        game:'coh3',
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
                    matchActiveStatus = true;
                    matchObject.filename_start = dirent.name;
                    matchObject.frame_start = frameCount;  
                    
                    //Find Team 1 

                    

                    text.split('\n').forEach(playerLine => {
                    var playerInfoObject = {};
                    if(playerLine.length > 4){
                        playerInfo = playerLine.split(' ');
                      //  console.log(playerInfo);

                        playerInfoObject.rank = playerInfo[0].replace('s',5);
                        playerInfoObject.elo = playerInfo[1];
                        playerInfoObject.name = playerInfo[2];
                        matchObject.team1.push(playerInfoObject);
                    }

                    });
                    
                    //** Identify Team 2 **/

                    const Team2Worker = await createWorker('eng');
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
                    })();



                    //** Identify Map  */
                    const MapWorker = await createWorker('eng');
                    //fetch map name
                    rectangle = { left: 524, top: 224, width: 236, height: 30 }; 
                    (async () => {
                        const { data: { text } } = await MapWorker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                        console.log('Map attempt'+text);
                        matchObject.map = text.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase();
                        console.log(matchObject);
                       // matchObjects[matchObjects.length-1].map = text;
                        await MapWorker.terminate();
                    })();

                    
                    console.log('Found Battle Start in file: '+dirent.name, matchObject);
                
                    }     
                    
                    
                 
        
                await worker.terminate();

           


                })();


                     //** identify Map **/
                 
            
           }



           if(matchActiveStatus)
           {

            const victoryWorker = await createWorker('eng');
            //fetch map name
            rectangle = { left: 224, top: 19, width: 269, height: 36 }; 
            (async () => {
                const { data: { text } } = await victoryWorker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
                if(text.includes("VICTORY")){matchObject.victory = true; }
                await victoryWorker.terminate();
            })();



            const worker = await createWorker('eng');
            var rectangle = { left: 981, top: 631, width: 121, height: 43 };  //watch bottom right for save replay
            
            var result = await (async () => {
            const { data: { text } } = await worker.recognize('assets/img/frames/'+dirent.name, { rectangle }); // has to be called rectangle
            console.log(text);
    
    
            if(text.includes("SAVE REPLAY")){



              
    
                
                matchActiveStatus = false;
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


// Add other functions as sample here


module.exports = coh3;
