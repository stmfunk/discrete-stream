$(document).ready(function() {
    const mainVid = $('video')[0];

    const socket = io();

    var videoState = {
      currentTime:0,
      playing:false
    };

    const updateState = function(state) {
      console.log(state);
      mainVid.currentTime = Math.floor(state.currentTime);
      state.playing ? mainVid.play() : mainVid.pause();
      console.log('connection');
    }

    const stateChange = function() { 
      videoState = {
        currentTime: mainVid.currentTime,
        playing: !mainVid.paused
      }

      socket.emit('videoState', videoState);
    };

    socket.on('stateChange', updateState);

    mainVid.onplay = stateChange;
    mainVid.onpause = stateChange;

});
