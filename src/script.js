/** TODO
 * 1. check dynamic update of bpm --UPDATE NON NE VENGO A CAPO
 * 2. check if slider visualization now works --FOLDATO NON è IMPORTANTE PER IL MOMENTO
 * 3. manage shapes --UPDATE riusciamo a bindare una width diversa per ogni layer
*/

Vue.config.devtools = true

let instSelComponent = {

    template:'\
           <div class="inst_sel"\
           @click="instSelection"\
           :style="cssVars">\
           </div>\
    ',

    props:{
        id: {
            type: Number,
        },
        selected_inst:{
            type: Number,
        }
    },

    methods: {
        instSelection() {
           inst_id=this.id
           this.state = true
           this.$emit('instSelectionEvent', inst_id)
       },
    },

    computed: {
        cssVars() {
            activeCSScolors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)']
            passiveCSScolors = ['rgb(120, 0, 0)','rgb(0, 0, 120)','rgb(0, 120, 0)']
            if(this.id==this.selected_inst){
            return{
                '--inst_sel_color': activeCSScolors[this.id-1],
                '--inst_sel_border': '0px'
            }}
            return{
                '--inst_sel_color': passiveCSScolors[this.id-1],
                '--inst_sel_border': '2px'
            }
        }
    }
}

let controllerComponent = {
    template:'\
       <div class="controller">\
            <input class="text-input" type="number" v-model="newInput" placeholder="Add a layer (press enter)" @keyup.enter="addLayer">\
            <input class="text-input" type="number" v-model="bpm_value" placeholder="Select bpm (press enter)" @keyup.enter="updateBPM">\
            <button class="btn-1" @click="playAll">Play all</button>\
            <button class="btn-1" @click="stopAll">Stop</button>\
            <label>Instrument:</label>\
            <inst-component v-for="k in 3"\
            :id="k"\
            :selected_inst=selected_inst\
            @instSelectionEvent="instSelection">\
            </inst-component>\
        </div>\
    ',

    components: {
        'inst-component' : instSelComponent,
    },

    props: {
        id: {},
        selected_inst:{
            default: 1,
        }
    },

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
            this.newInput = ''
        },
        updateBPM() {
            this.$emit('bpmEvent', this.bpm_value_toNumber)
            this.bpm_value = '' 
        },
        playAll() {
            this.$emit('playAllEvent')
        },
        stopAll() {
            this.$emit('stopAllEvent')
        },
        instSelection(inst_id) {
            this.selected_inst=inst_id
            this.$emit('instSelectionEvent', inst_id)
        },
    },

};

let keyComponent = {

    template:'\
        <div>\
           <div class="key"\
           :class="{active : state1 || state2 || state3}"\
           @click="toggleActive"\
           :style="cssVars">\
           </div>\
        </div>\
    ',
   
    props: {
        state1: {
            default: false,
            required: true,
        },
        state2: {
           default: false,
           required: true,
       },
       state3: {
           default: false,
           required: true,
       },
        isPlaying: {
            type: Number,
        },
        id: {
            type: Number,
        },
        myLayerId: {
            type: Number,
        },
        inst_selection:{
            type: Number,
        },
        last_color:{
            type: Number,
            default: 0,
        },
        very_last_color:{
           type: Number,
           default: 0,
       }
    },

    methods: {
        toggleActive() {
            switch(this.inst_selection){
               case 1: this.state1 = !this.state1
                       if(this.state1){
                       this.$emit('playSound1Event')
                       }break;
               case 2: this.state2 = !this.state2
                       if(this.state2){
                       this.$emit('playSound2Event')
                       }break; 
               case 3: this.state3 = !this.state3
                       if(this.state3){
                       this.$emit('playSound3Event')
               }break;
            }
        }
    },
    watch: {
        'isPlaying': function(){
            if(this.state1 && this.isPlaying == this.id){
                this.$emit('playSound1Event')
            }
            if(this.state2 && this.isPlaying == this.id){
               this.$emit('playSound2Event')
           }
           if(this.state3 && this.isPlaying == this.id){
               this.$emit('playSound3Event')
           }
        }
    },
    computed: {
       cssVars() {
           CSScolors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)'] /* Modifica qui i colori degli strumenti*/
           if(this.state1 && this.state2 &&this.state3){
               return {
                   '--inst_color': CSScolors[3-this.very_last_color-this.last_color],
                   '--shadow': '-7px 0 '+CSScolors[this.very_last_color]+',-14px 0 '+CSScolors[this.last_color],
                   '--inst_shift': '7px',
                   }
               }
           if(this.state1 && this.state2){
               this.very_last_color = Math.abs(this.last_color-1)
               return {
                   '--inst_color': CSScolors[this.very_last_color],
                   '--shadow': '-7px 0 '+CSScolors[this.last_color],
                   '--inst_shift': '3.5px',
                   }
               }
           if(this.state2 && this.state3){
               this.very_last_color = Math.abs(this.last_color-3)
               return {
                   '--inst_color': CSScolors[this.very_last_color],
                   '--shadow': '-7px 0 '+CSScolors[this.last_color],
                   '--inst_shift': '3.5px',
                   }
               }
           if(this.state1 && this.state3){
               this.very_last_color = Math.abs(this.last_color-2)
               return {
                   '--inst_color': CSScolors[this.very_last_color],
                   '--shadow': '-7px 0 '+CSScolors[this.last_color],
                   '--inst_shift': '3.5px',
                   }
               }
           if(this.state1){
               this.last_color = 0
               return {
                   '--inst_color': CSScolors[0],
                   '--inst_shift': '0px',
                   }
               }
           else if(this.state2){
               this.last_color = 1
               return {
                   '--inst_color': CSScolors[1],
                   '--inst_shift': '0px',
                   }
               }
           else if(this.state3){
               this.last_color = 2
               return {
                   '--inst_color': CSScolors[2],
                   '--inst_shift': '0px',
                   }
               }
       }
    }
}

let scaleSelectorComponent = {

    template: '\
    <div id="scale-selector">\
        <a href="#">Select scale</a>\
        <ul>\
            <li><a href="#">Scale 1</a></li>\
            <li><a href="#">Scale 2</a></li>\
            <li><a href="#">Scale 3</a></li>\
            <li><a href="#">Scale 4</a></li>\
            <li><a href="#">Scale 5</a></li>\
        </ul>\
    </div>\
'

};

let layerComponent = {
 
     template:'\
        <div class="layer">\
            <div class="keyboard">\
                <key-component v-for="k in num_beats"\
                    class="keyback" :style="cssVars"\
                    :class="{playing : k === isPlaying + 1}"\
                    :myLayerId="layerId"\
                    :numKeys="num_beats"\
                    :id="k-1"\
                    :isPlaying="isPlaying"\
                    :inst_selection="inst_id"\
                    @playSound1Event="playInst1"\
                    @playSound2Event="playInst2"\
                    @playSound3Event="playInst3">\
                </key-component>\
            </div>\
            <div class="layer-controller">\
                <button id="remove-btn" @click="$emit(\'remove\')">Remove layer</button>\
                <button id="addKey-btn" @click="$emit(\'addKeyEvent\')"> + </button>\
                <button id="removeKey-btn" @click="$emit(\'removeKeyEvent\')"> - </button>\
                <scale-selector-component></scale-selector-component>\
            </div>\
        </div>\
     ',
     
     components: {
         'key-component' : keyComponent,
         'scale-selector-component' : scaleSelectorComponent,
     },
     
  
    props : ['layerId','num_beats','total_duration','system_playing','inst_id'],
    
    data() {
        return {
            isPlaying: 0,
            my_clock: '',
            margin: 5,
            inst_selection: 1,
        }
    },
    
    computed: {
        my_beat_duration() {
            return this.total_duration/this.num_beats;
        },
        layer_width() { 
            //return document.getElementById('app').offsetWidth - 24
            return 500
        }, /* 698 - layer margin né app border = 674 */
        cssVars() {
            return {
                '--margin': this.margin + 'px',
                '--keyWidth': (this.layer_width - this.num_beats*2*this.margin)/this.num_beats + 'px'
                }
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
        playInst1(){
            synth1.triggerAttackRelease("A4","16n")
        },
        playInst2(){
            synth2.triggerAttackRelease("D4","16n")
        },
        playInst3(){
            synth3.triggerAttack("E4");
        },
    }
};

let sequencerComponent = {
    
    template: '\
        <div>\
            <div class="view-box">\
                <p class="viewer">BPM: {{bpm}}</p>\
                <p class="viewer">Selected instrument: {{inst_name[inst_id-1]}}</p>\
            </div>\
            <controller-component\
                @newLayerEvent="addLayer"\
                @bpmEvent="updateBPM"\
                @playAllEvent="playAll"\
                @stopAllEvent="stopAll"\
                @instSelectionEvent="instSelection"\
            ></controller-component>\
            <div id="layers-container">\
                <layer-component v-for="(layer,index) in layers"\
                    ref="layers_refs"\
                    :layerId="layer.id"\
                    :num_beats="layer.num_beats"\
                    :total_duration="bar_duration"\
                    :system_playing="playing"\
                    :inst_id="inst_id"\
                    @remove="layers.splice(index,1)"\
                    @addKeyEvent="layer.num_beats++"\
                    @removeKeyEvent="layer.num_beats--">\
                </layer-component>\
            </div>\
        </div>\
    ',
    
    components: {
        'layer-component' : layerComponent,
        'controller-component' : controllerComponent,
    },
    
    data(){
        return {
            bpm: 120,
            playing: false,
            nextId: 2,
            layers: [
                {
                    id: 0,
                    num_beats: 3
                },
                {
                    id: 1,
                    num_beats: 2
                },
            ],
            inst_id: 1,
            inst_name: ['nome_strumento1','nome_strumento2','nome_strumento3'] /*mettere nomi degli strumenti*/
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
            this.layers.push(
                {   
                    id: this.nextId,
                    num_beats: num_beats_input
                }
            )
            this.nextId += 1
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
        instSelection(inst_id) {
            this.inst_id=inst_id
        },
    }
}

var app = new Vue({
    el:'#app',
    components: {
        'sequencer-component': sequencerComponent
    }
})

var synth1 = new Tone.PolySynth().toDestination();
var synth2 = new Tone.DuoSynth({
    vibratoAmount  : 0.5 ,
    vibratoRate  : 5 ,
    harmonicity  : 1.5 ,
    voice0  : {
    volume  : -10 ,
    portamento  : 0 ,
    oscillator  : {
    type  : "sine"
    }  ,
    filterEnvelope  : {
    attack  : 0.01 ,
    decay  : 0 ,
    sustain  : 1 ,
    release  : 0.5
    }  ,
    envelope  : {
    attack  : 0.01 ,
    decay  : 0 ,
    sustain  : 1 ,
    release  : 0.5
    }
    }  ,
    voice1  : {
    volume  : -10 ,
    portamento  : 0 ,
    oscillator  : {
    type  : "sine"
    }  ,
    filterEnvelope  : {
    attack  : 0.01 ,
    decay  : 0 ,
    sustain  : 1 ,
    release  : 0.5
    }  ,
    envelope  : {
    attack  : 0.01 ,
    decay  : 0 ,
    sustain  : 1 ,
    release  : 0.5
    }
    }
    }).toDestination();
var synth3 = new Tone.PluckSynth({
    attackNoise  : 1 ,
    dampening  : 8000 ,
    resonance  : 0.9
    }).toDestination();