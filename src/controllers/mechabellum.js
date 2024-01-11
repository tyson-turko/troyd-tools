



function parseStreamVideo(filename){

    var exec = require('child_process').exec; 
  
    // calculate FPS of video, adjust ratio   
  
    fsExtra.emptyDirSync('assets/img/frames');
    var cmd = 'ffmpeg -i "'+process.env.streamVideoDirectory+filename+'" -q:v 1 -vf format=gray,fps=0.33333,lutyuv="y=negval:u=negval:v=negval" assets/img/frames/%06d.jpg';
    //var cmd = 'ffmpeg -i videos/videotest.mp4 -vf "fps=0.5" -q:v 1 -vf format=gray img/frames/%d.jpg';
  
    exec(cmd, function(err, stdout, stderr) {
      if (err) console.log('err:\n' + err);
      if (stderr) console.log('stderr:\n' + stderr);
      console.log('stdout:\n' + stdout);
  });
    console.log('I am finished?');
  
  
  }

module.exports = {parseStreamVideo};