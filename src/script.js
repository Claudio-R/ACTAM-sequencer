/** TODO
 * 1. check dynamic update of bpm --UPDATE NON NE VENGO A CAPO
 * 2. check if slider visualization now works --FOLDATO NON è IMPORTANTE PER IL MOMENTO
 * 3. manage shapes
 */

Vue.config.devtools = true

let controllerComponent = {
    template:'\
        <div class="controller-container">\
            <input class="text-input" type="number" v-model="newInput" placeholder="Add a layer (press enter)" @keyup.enter="addLayer">\
            <input class="text-input" type="number" v-model="bpm_value" placeholder="Select bpm (press enter)" @keyup.enter="updateBPM">\
            <button class="btn-1" @click="playAll">Play all</button>\
            <button class="btn-1" @click="stopAll">Stop</button>\
        </div>\
    ',
    data() {
        return {
            newInput: '',
            bpm_value: '',
        }

    },

    computed: {
        newInput_toNumber() {
            return this.newInput ? parseInt(this.newInput) : null
        },
        bpm_value_toNumber() {
            return this.bpm_value ? parseInt(this.bpm_value) : null
        }
    },

    methods: {
        addLayer() {
            this.$emit('newLayerEvent', this.newInput_toNumber)
        },
        updateBPM() {
            this.$emit('bpmEvent', this.bpm_value_toNumber)
        },
        playAll() {
            this.$emit('playAllEvent')
        },
        stopAll() {
            this.$emit('stopAllEvent')
        },
    }
};

let keyComponent = {

    template:'\
        <div class="key" :class="{active : state}" \
        @click="toggleActive"></div>\
    ',

    props: {
        state: {
            default: false,
            required: true,
        },
        isPlaying: {
            default: false,
            required: true,
        }
    },

    methods: {
        toggleActive() {
            this.state = !this.state
        }
    }
}

let layerComponent = {

    template:'\
        <div>\
            <key-component v-for="k in num_beats"\
            :class="{playing : k === isPlaying + 1}"></key-component>\
            <button class="ctrl-btn" @click="$emit(\'remove\')">Remove layer</button>\
        </div>\
    ',
    
    components: {
        'key-component' : keyComponent
    },
    
    props : ['num_beats','total_duration','system_playing'],
    
    data() {
        return {
            isPlaying: 0,
            my_clock: '',
        }
    },
    
    computed: {
        my_beat_duration() {
            return this.total_duration/this.num_beats;
        }
    },

    methods: {
        next() {
            this.isPlaying = (this.isPlaying + 1) % (this.num_beats);
        },
        stop() {
            clearInterval(this.my_clock)
        },
        play() {
            this.stop();
            this.my_clock = setInterval(this.next,this.my_beat_duration)
        },
    }
};

let sequencerComponent = {
    
    template: '\
        <div>\
            <div class="view-box">\
                <p id="bpm-viewer">BPM: {{bpm}}</p>\
            </div>\
            <controller-component\
                @newLayerEvent="addLayer"\
                @bpmEvent="updateBPM"\
                @playAllEvent="playAll"\
                @stopAllEvent="stopAll"\
            ></controller-component>\
            <layer-component class="layer" v-for="(layer,index) in layers"\
                ref="layers_refs"\
                :num_beats="layer.num_beats"\
                :total_duration="bar_duration"\
                :system_playing="playing"\
                @remove="layers.splice(index,1)">\
            </layer-component>\
        </div>\
    ',
    
    components: {
        'layer-component' : layerComponent,
        'controller-component' : controllerComponent,
    },
    
    data(){
        return {
            bpm: 60,
            playing: false,
            layers: [
                {
                    num_beats: 4
                },
                {
                    num_beats: 5
                },
            ]
        }
    },

    computed: {
        bar_duration() {
            if(this.layers[0]){
                return this.layers[0].num_beats*60000/this.bpm
            }
        }
    },

    methods: {
        addLayer(num_beats_input) {
            this.layers.push({num_beats: num_beats_input})
        },
        /** errors when bpm is updated while playing */
        updateBPM(bpm_input) {
            /** assign new bpm value */
            this.bpm = bpm_input
        },
        /** l'uso di $ref non è dinamico, quindi se aggiungo layer quando sto suonando l'ultimo layer non parte */
        playAll() {
            /** first reset all layers */
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].isPlaying = 0
            }
            /** then restart */
            this.playing = true
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].play()
            }
        },
        stopAll() {
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].stop()
            }
            this.playing = false
        },
    }
}

var app = new Vue({
    el:'#app',
    components: {
        'sequencer-component': sequencerComponent
    }
})