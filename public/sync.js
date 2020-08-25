$(document).ready(function() {
    const mainVid = $('video')[0];
    const socket = io();

    var justUpdate = false;

    var videoState = {
      currentTime:0,
      playing:false
    };

    const updateState = function(state) {
      mainVid.currentTime = Math.floor(state.currentTime);
      state.playing ? mainVid.play() : mainVid.pause();
      justUpdate = true;
    }

    const stateChange = function() { 
      videoState = {
        currentTime: mainVid.currentTime,
        playing: !mainVid.paused
      }

      if (!justUpdate) {
        socket.emit('videoState', videoState);
        justUpdate = false;
      }
    };

    socket.on('stateChange', updateState);

    mainVid.onplay = stateChange;
    mainVid.onpause = stateChange;

});
