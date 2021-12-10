/**
 * TODO
 * 1. add playing beat function
 * 2. adjust size of beats
 */

Vue.component('beat-component', {
    template: '\
        <li\
            {{ this }}\
            <button v-on:click="$emit(\'toggle\')"></button>\
        ></li>\
    ',
})

Vue.component('layer-component', {

    template: '\
        <ol>\
            <li\
                is="beat-component"\
                v-for="(b, index) in beats"\
                v-bind:class="{beat: true, active: b, playing: index == isPlaying}"\
                v-on:toggle="toggleBeat(index)"\
            ></li>\
            <button class="remove-layer-button" v-on:click="$emit(\'remove\')">Remove layer</button>\
        </ol>\
    ',
    props: ['beats', 'isPlaying', 'beat_duration'],

    computed: {
        beat_duration: {
            function() {
                return sequencer.beat_duration/this.beats.length
            }
        }
    },

    methods: {
        toggleBeat: function(index) {
            Vue.set(this.beats, index, !this.beats[index]);
        },
        nextBeat: function() {
            this.isPlaying = (this.isPlaying + 1) % this.beats.length;
        }

    }
})

var sequencer = new Vue({ 
    
    el:'#sequencer',

    data: {
        //slider: document.querySelector('#bpm-selector'),
        bpm: 90,
        clock: '',
        layers: [], // modificando i valori in questo array si modificano dinamicamente i componenti grazie a v-bind
        nextLayerId: 3,
        num_beats: '',
        total_duration: '',
    },

    methods: {
        addNewLayer: function() {
            var beats_array  = [];
            var single_beat_duration;
            // crea un array del numero corretto di beats
            for(var i=0; i<this.num_beats; i++) {
                beats_array.push(false);
            };
            // reference duration
            if(!this.layers[0]){
                this.total_duration = this.num_beats*60000/this.bpm
            }
            single_beat_duration = this.total_duration/this.num_beats
            this.layers.push({
                id: this.nextLayerId++,
                beats: beats_array,
                beat_duration: single_beat_duration,
                isPlaying: null,
            })
            this.num_beats = '';
        },

        bpm_updated: function() {
            var single_beat_duration;

            for(var i=0; i<this.layers.length; i++) {
                single_beat_duration = this.total_duration/this.layers[i].beats.length
                this.layers[i].beat_duration = single_beat_duration
                console.log(this.layers[i].beat_duration)
            }
        }
    }
});

 // MODEL
var slider = document.getElementById('bpm-selector')
slider.oninput = function() {
    sequencer.bpm = parseInt(this.value);
    
    if(sequencer.layers[0]) { 
        sequencer.total_duration = sequencer.layers[0].beats.length*60000/sequencer.bpm;
        sequencer.bpm_updated() 
    }; 
}
 
