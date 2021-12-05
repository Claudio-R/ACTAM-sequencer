import Vue from "/node_modules/vue/dist/vue.min.js";
import * as Tone from 'tone';

/* MODEL */

var sequencer = new Vue({
    
    el:"#sequencer",
    
    data: {
        beat: 0,
        totalBeats: 8,
        keys: [false, false, false, false, false, false, false, false],
        bpm: 180,
    }, 
    
    methods: {
        toggleKey: function(index) {
            Vue.set(this.keys, index, !this.keys[index]);
        },
        nextBeat: function() {
            this.beat = (this.beat + 1) % this.totalBeats;
        }
    }
})

global.sequencer = sequencer

const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();

/* VIEW */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

var clock=null;
slider.oninput = function() {
    clearInterval(clock)
    console.log(this.value)
    sequencer.bpm = this.value
    clock = setInterval(playBeat, 60000/sequencer.bpm)
}

/*CONTROLLER*/

function playBeat() {
    sequencer.nextBeat()
    if(sequencer.keys[sequencer.beat]) { player.start() }
}

Tone.loaded().then(() => {        
    console.log("Preset loaded")
});

document.querySelector("#butt1").onclick = function (){
    console.log("pressed")
    sequencer.totalBeats += 1;
    sequencer.keys.push(true);

    console.log(sequencer.totalBeats);
}

document.querySelector("#butt2").onclick = function (){
    console.log("pressed")
    sequencer.totalBeats -= 1;
    sequencer.keys.pop();

    console.log(sequencer.totalBeats)
}

