
const fsExtra = require('fs-extra');
var fs = require('fs');

var video = {};

video.test = function(){
   // Write your code here
   console.log('Hello World');
   console.log();
};



video.parseVideo = async function(videoFilename){

    var exec = require('child_process').exec; 
  
    // calculate FPS of video, adjust ratio 
  
  
    fsExtra.emptyDirSync('assets/img/frames');
    var cmd = 'ffmpeg -i "'+process.env.streamVideoDirectory+'/'+videoFilename+'" -q:v 1 -vf format=gray,fps=0.33333,lutyuv="y=negval:u=negval:v=negval",eq=contrast=3:saturation=3:brightness=3 assets/img/frames/%06d.jpg';
  
    exec(cmd, function(err, stdout, stderr) {
      if (err) console.log('err:\n' + err);
      if (stderr) console.log('stderr:\n' + stderr);
      console.log('stdout:\n' + stdout);
  });
    console.log('I am finished?');
  
  
  }



  video.cutMatchVideos = async function(matchObjects,videoFilename)
  {
    var __dirOutput = 'assets/videos/';
  //  console.log(matchObjects);
    matchObjects.forEach(function (match,index) {

      /// Save match object to file
        var jsonData = JSON.stringify(match);
        fs.writeFile(''+__dirOutput+'output_'+index+".json", jsonData, function(err) {
            if(err) console.log(err);           
        });
  
      if(match.frame_end)
      {
   
        var start = new Date((match.frame_start-1)  * 1000).toISOString().substring(11, 19);
        var end = new Date((match.frame_end)  * 1000).toISOString().substring(11, 19);
      
        console.log(start,end);      
      

        // Cut the videos      
          var cmd = 'ffmpeg -ss '+start+' -to '+end+' -i "'+process.env.streamVideoDirectory+'/'+videoFilename+'" -c copy '+__dirOutput+'output_'+index+'.mp4'; // cut video
        var exec = require('child_process').exec;
        exec(cmd, function(err, stdout, stderr) {
          if (err) console.log('err:\n' + err);
          if (stderr) console.log('stderr:\n' + stderr);
          console.log('stdout:\n' + stdout); 
          });  
    
        //Screenshtos of start
         var cmd = 'ffmpeg -ss '+start+' -i "'+process.env.streamVideoDirectory+'/'+videoFilename+'" -frames:v 1 -q:v 1 '+__dirOutput+'output_'+index+'_'+match.victory+'_thumbnail_raw.png'; // potential thumbnail for match up
          var exec = require('child_process').exec;
          exec(cmd, function(err, stdout, stderr) {
            if (err) console.log('err:\n' + err);
            if (stderr) console.log('stderr:\n' + stderr);
            console.log('stdout:\n' + stdout); 
            });
         
  
          }
    });
  
    
      console.log('Finished Cutting All Matches');
  
  
  }
  
  


// Add other functions as sample here


module.exports = video;