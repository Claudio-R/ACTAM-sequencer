/** TODO
 * 1. check dynamic update of bpm --UPDATE NON NE VENGO A CAPO
 * 2. check if slider visualization now works --FOLDATO NON è IMPORTANTE PER IL MOMENTO
 * 4. provare a gestire key e scale con v-model -- UPDATE CREATA VARIABILE
*/

Vue.config.devtools = true

let instSelComponent = {

    template:'\
            <div class="inst-container">\
                <div class="inst_sel"\
                    @click="instSelection"\
                    @mouseover="menu=true"\
                    @mouseleave="menu=false"\
                    :style="cssVars">\
                </div>\
                <div class="inst-menu"\
                    @mouseover="menu=true"\
                    @mouseleave="menu=false"\
                    v-show="menu">\
                        <label>Volume:<label>\
                        <input type="range" min="-40" max="3" v-model="volume"></input>\
                        <div v-if="id!=3">\
                        <label>Duration:<label>\
                        <input type="range" min="0" max="4" v-model="duration"></input>\
                        </div>\
                </div>\
            </div>\
    ',

    props:{
        id: { type: Number, },
        selected_inst:{ type: Number, },
        menu:{default: false},
        volume:{default: 0},
        duration:{default: 1}
    },

    methods: {
        instSelection() {
           this.state = true
           this.$emit('instSelectionEvent', this.id)
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
    },
    watch: {
        'volume': function() {
            if(this.id==1) { 
                synth1.volume.value = this.volume;
            } 
            if(this.id==2) { 
                synth2.volume.value = this.volume;
            }
            if(this.id==3) { 
                for(i=0;i<8;i++){
                drum[i].volume.value = this.volume;
                }
            }
        },
        'duration': function() {
            this.$emit('durationChangeEvent', this.id, this.duration)
        }
    },
}

let controllerComponent = {
    template:'\
       <div class="controller">\
            <input type="number" v-model="newInput" placeholder="Add a layer (press enter)" @keyup.enter="addLayer">\
            <input type="number" v-model="bpm_value" placeholder="Select bpm (press enter)" @keyup.enter="updateBPM">\
            <button @click="$emit(\'playAllEvent\')">Play</button>\
            <button @click="$emit(\'stopAllEvent\')">Stop</button>\
            <button @click="$emit(\'unifiedControllerEvent\')">Unify controller</button>\
            <div id="instrumentContainer">\
            <label>Instrument:</label>\
            <inst-component v-for="k in num_inst"\
                :id="k"\
                :selected_inst=selected_inst\
                @instSelectionEvent="instSelection"\
                @durationChangeEvent="emitDuration">\
            </inst-component>\
        </div>\
    ',

    components: {
        'inst-component' : instSelComponent,
    },

    props: {
        selected_inst:{
            default: 1,
        }
    },

    data() {
        return {
            newInput: '',
            bpm_value: '',
            num_inst: 3,
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
        instSelection(inst_id) {
           this.$emit('instSelectionEvent', inst_id)
           this.selected_inst=inst_id
       },
       emitDuration(inst_id,duration){
        this.$emit('durationEvent', inst_id, duration)
       }
    }
};

let menuElementcomponent = {
    template:'<div @click="$emit(\'selectionEvent\', element)"> {{ element }} </div>',
    props: ['element']
}

let scaleSelectorComponent = {

    template: '\
        <div id="key-selector" class="selector"> {{ selectedScale }}\
            <menu-element-component v-for="mode in scales"\
                class="menu-element"\
                :element="mode"\
                @selectionEvent="selectScale">\
            </menu-element-component>\
        </div>\
    ',

    components: {
        'menu-element-component' : menuElementcomponent,
    },

    data() {
        return {
            selectedScale: 'Major',
            scales: ['Major','Minor','Melodic Minor','Harmonic Minor','Diminished','Augmented','Hexatonic'],
        }
    },

    methods: {
        selectScale(scale) {
            this.selectedScale = scale;
            this.$emit('scaleSelectedEvent', scale)
        }
    }
};

let keySelectorComponent = {

    template: '\
        <div id="key-selector" class="selector">Selected key: {{ selectedKey }}\
            <menu-element-component v-for="note in keys"\
                class="menu-element"\
                :element="note"\
                @selectionEvent="selectKey">\
            </menu-element-component>\
        </div>\
    ',

    components: {
        'menu-element-component' : menuElementcomponent,
    },

    data() {
        return {
            selectedKey: 'C',
            keys: ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],
        }
    },

    methods: {
        selectKey(note) {
            this.selectedKey = note;
            this.$emit('keySelectedEvent', note)
        }
    }
};

let keyComponent = {
    template:'\
        <div @click="toggleActive">\
            <div class="key"\
                :class="{active : state1 || state2 || state3}"\
                :style="cssVars">\
            </div>\
        </div>\
    ',
   
    props: {
        beatId: { type: Number },
        keyId: {type: Number },
        state1: { default: false },
        state2: { default: false },
        state3: { default: false },
        pot: {type: Boolean},
        
        prelistenKey: {type: Boolean, default: true},
        beatMuted: { type: Boolean, default: false },
        layerMuted: { type: Boolean, default: false },

        isPlaying: { type: Number },
        inst_selected:{ type: Number },
        last_color:{ type: Number, default: 0 },
        very_last_color:{ type: Number, default: 0 }
    },
    
    watch: {
        'isPlaying': function() {
            if(!this.layerMuted && !this.beatMuted && this.isPlaying == this.beatId) { 
                this.playKey();
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
                   '--shadow': '-7px 0 '+ CSScolors[this.last_color],
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
    },

    methods: {
        toggleActive() {
            switch(this.inst_selected){
                case 1:
                    this.state1 = !this.state1
                    if(!this.layerMuted && !this.beatMuted && this.prelistenKey && this.state1){
                        this.$emit('playSound1Event',this.keyId)
                    } break;
                case 2: 
                    this.state2 = !this.state2
                    if(!this.layerMuted && !this.beatMuted && this.prelistenKey && this.state2){
                        this.$emit('playSound2Event',this.keyId)
                    } break; 
                case 3: 
                    this.state3 = !this.state3
                    if(!this.layerMuted && !this.beatMuted && this.prelistenKey && this.state3){
                        this.$emit('playSound3Event',this.keyId)
                    } break;
            } 
        },

        playKey() {
            if(this.state1){
                this.$emit('playSound1Event',this.keyId)
            }
            if(this.state2){
                this.$emit('playSound2Event',this.keyId)
            }
            if(this.state3){
                this.$emit('playSound3Event',this.keyId)
            }
        },

        clearKey() {
            if(this.state1){ this.state1 = !this.state1 }
            if(this.state2){ this.state2 = !this.state2 }
            if(this.state3){ this.state3 = !this.state3 }
        },
        setKey(state1,state2,state3){
            this.state1=state1
            this.state2=state2
            this.state3=state3
        }
    },

}

let columnComponent = {
    template: '\
        <div>\
            <key-component v-for="k in tonesInScale"\
                class="keyback"\
                ref="keys_refs"\
                :isPlaying="isPlaying"\
                :inst_selected="inst_selected"\
                :beatId="beatId"\
                :keyId=tonesInScale-k\
                :prelistenKey="prelistenBeat"\
                :beatMuted="beatMuted"\
                :layerMuted="layerMuted"\
                @playSound1Event="playInst1"\
                @playSound2Event="playInst2"\
                @playSound3Event="playInst3"\
            ></key-component>\
            <div id="beat-controller">\
                <button class="beat-btn monitor-btn" @click="for(var idx=0; idx<tonesInScale; idx++) { $refs.keys_refs[idx].playKey() }">P</button>\
                <button class="beat-btn mute-btn" :class="{ muteActive : beatMuted }" @click="beatMuted=!beatMuted">M</button>\
                <button class="beat-btn clear-btn" @click="clearAllKeys">C</button>\
            </div>\
        </div>\
    ',

    components : {
        'key-component' : keyComponent,
    },

    props : ['beatId','prelistenBeat','layerMuted','tonesInScale', "inst_selected", 'isPlaying','scale_keyboard','duration'],

    data() {
        return {
            beatMuted: false,
        }
    },

    methods : {
        playInst1(keyId){
            synth1.triggerAttackRelease(this.scale_keyboard[keyId],this.duration[0])
        },
        playInst2(keyId){
            synth2.triggerAttackRelease(this.scale_keyboard[keyId],this.duration[1])
        },
        playInst3(keyId){
            drum[keyId].start();
        },
        getKeyProps() {
            var key_state1 = []
            var key_state2 = []
            var key_state3 = []
            for(j=0;j<this.tonesInScale;j++){
                key_state1[j]=this.$refs.keys_refs[j].state1;
                key_state2[j]=this.$refs.keys_refs[j].state2;
                key_state3[j]=this.$refs.keys_refs[j].state3;
            }
            return {key_state1,key_state2,key_state3}
        },
        setColumn(newvar){
            key_state1=newvar.key_state1
            key_state2=newvar.key_state2
            key_state3=newvar.key_state3
            for(j=0;j<this.tonesInScale;j++){
                this.$refs.keys_refs[j].setKey(key_state1[j],key_state2[j],key_state3[j])
            }
        },
        clearAllKeys(){
            for(var idx=0; idx<this.tonesInScale; idx++) { 
                this.$refs.keys_refs[idx].clearKey() 
            }
        }
    }
}

let layerComponent = {
    template:'\
        <div class="layer">\
            <div class="layer-labels">\
                <div v-if="inst_id==3">\
                    <p class="key-label" v-for="k in tonesInScale">{{drum_keyboard[tonesInScale-k]}}</p>\
                </div>\
                <div v-else>\
                    <p class="key-label" v-for="k in tonesInScale">{{scale_keyboard[tonesInScale-k].slice(0, -1)}}</p>\
                </div>\
                <button v-if="unifiedControl" class="remove-btn-unified" @click="$emit(\'remove\')">Remove layer</button>\
            </div>\
            \
            <div v-for="j in n_bars">\
                <div class="keyboard">\
                    <column-component v-for="k in num_beats"\
                        class="column" :style="cssVars"\
                        ref = beats_refs\
                        :class="{playing : k*j-(k-num_beats)*(j-1) === isPlaying + 1}"\
                        :beatId="k*j-1-(k-num_beats)*(j-1)"\
                        :prelistenBeat="prelistenLayer"\
                        :layerMuted="layerMuted"\
                        :isPlaying="isPlaying"\
                        :inst_selected="inst_id"\
                        :scale_keyboard="scale_keyboard"\
                        :tonesInScale="tonesInScale"\
                        :duration="duration"\
                    ></column-component>\
                </div>\
            </div>\
            \
            <div v-if="!unifiedControl" class="layer-controller">\
                <div id="buttons">\
                    <button id="remove-btn" @click="$emit(\'remove\')">Remove layer</button>\
                    <button id="addKey-btn" @click="$emit(\'addKeyEvent\')"> + </button>\
                    <button id="removeKey-btn" @click="$emit(\'removeKeyEvent\')"> - </button>\
                </div>\
                <key-selector-component\
                    @keySelectedEvent="printKey">\
                </key-selector-component>\
                <scale-selector-component\
                    @scaleSelectedEvent="printScale">\
                </scale-selector-component>\
                <div id="octave-selector">\
                    <div class="octave-viewer">Octave: {{octave}} </div>\
                    <button class="layer-btn" id="addKey-btn" @click="moreOctave"> + </button>\
                    <button class="layer-btn" @click="lessOctave"> - </button>\
                </div>\
                <div class="layer-sound-controller">\
                    <button class="layer-btn prelisten-btn" :class="{ prelistenActive : prelistenLayer }" @click="prelistenLayer=!prelistenLayer">L</button>\
                    <button class="layer-btn mute-btn" :class="{ muteActive : layerMuted }" @click="layerMuted=!layerMuted">M</button>\
                    <button class="layer-btn clear-btn" @click="clearLayer">C</button>\
                </div>\
            </div>\
        </div>\
    ',
     
    components: {
        'column-component' : columnComponent,
        'scale-selector-component' : scaleSelectorComponent,
        'key-selector-component' : keySelectorComponent,
    },
    
    props : {
        num_beats: Number,
        total_duration: Number,
        inst_id: Number,
        n_bars: Number,

        prelistenLayer: {default: true},
        layerMuted: {default:false},
        unifiedControl: { default: true } ,
        duration: Array,
        
        key: { default: 'C' },
        scale: { default:'Major' },
        scale_keyboard : { default: ["C4","D4","E4","F4","G4","A4","B4","C5"] },
        drum_keyboard : { default: ["kick", "snare", "tom 1","tom 2","closed hh", "open hh", "ride","cowbell"] },
    },
    
    data() {
        return {
            isPlaying: 0,
            my_clock: '',
            tonesInScale: 8,
            keyboard: '',
            octave: 4,
        }
    },

    watch: {
        'isPlaying': function(val) {
            if(val==0){
                this.$emit('restartEvent');
            }
        }
    },
    
    computed: {
        beatPlaying() {
            return this.isPlaying;
        },
        my_beat_duration() {
            return Number(this.total_duration/(this.num_beats));
        },
        cssVars() {
            var layerWidth = 1200;
            //var layerWidth = 1200/this.num_bars; to make it adaptive
            var margin = 5;
            var borderKey = 3;
            var keyHeight = 18;
            return {
                '--columnWidth': (layerWidth - this.num_beats*2*margin)/(this.num_beats) + 'px', //157
                '--columnHeight' : this.tonesInScale*(keyHeight + 2*borderKey) + 'px',
            }
        },
    },

    methods: {
        next() {
            this.isPlaying = (this.isPlaying + 1) % (this.num_beats*this.n_bars);
        },
        stop() {
            clearInterval(this.my_clock)
        },
        play() {
            this.stop();
            this.my_clock = setInterval(this.next,this.my_beat_duration)
        },
        printScale(num_scale){
            console.log("Selected scale " + num_scale);
            this.scale = num_scale;
            this.keyboardCreator()
        },
        printKey(num_key){
            console.log("Selected key " + num_key)
            this.key = num_key;
            this.keyboardCreator()
        },
        keyboardCreator(){
            this.keyboard = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"]
            this.keyboard = this.keyboard.map(ele => ele + this.octave)
            while(this.key+this.octave!=this.keyboard[0]){
                first_element = this.keyboard.shift()
                first_element = first_element.slice(0, -1) + (this.octave+1)
                this.keyboard = this.keyboard.concat(first_element)
            }
            switch(this.scale){
                case 'Major': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2741 & (1 << index);
                });/*101010110101 and reversed = 2741*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                break;
                case 'Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1453 & (1 << index);
                });/*101101011010 and reversed = 1453*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                break;
                case 'Melodic Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2733 & (1 << index);
                });/*101010101101 and reversed = 2733*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                break;
                case 'Harmonic Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2477 & (1 << index);
                });/*100110101101 and reversed = 2477*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                break;
                case 'Diminished': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1755 & (1 << index);
                });/*110110110110 and reversed = 2925*/
                
                break;
                case 'Augmented': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2457 & (1 << index);
                });/*10011011001 and reversed = 2457*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octave+1))
                break;
                case 'Hexatonic': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1365 & (1 << index);
                });/*101010101010 and reversed = 1365*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave+1))
                this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octave+1))
                break;
            }
        },
        moreOctave(){
            if(this.octave<6){
                this.octave++
                this.keyboardCreator()
            }
        },
        lessOctave(){
            if(this.octave>2){
                this.octave--
                this.keyboardCreator()
            }
        },
        addLBar(){
            Vue.nextTick(() =>{
                //column_states = Array(this.num_beats)
                    for(i=0;i<this.num_beats;i++) {
                    newvar = this.$refs.beats_refs[i].getKeyProps()
                    this.$refs.beats_refs[i+(this.n_bars-1)*this.num_beats].setColumn(newvar)
                    //column_states[i]=(newvar)
                    }
            })
        },
        clearLayer(){
            for(var idx=0; idx<this.$refs.beats_refs.length; idx++) { 
                this.$refs.beats_refs[idx].clearAllKeys() }
        }
    },
};

let sequencerComponent = {
    
    template: '\
        <div>\
            <div class="view-box">\
                <div class="viewer">BPM: {{bpm}}</div>\
                <div class="viewer">Selected instrument: {{inst_name[inst_id-1]}}</div>\
                <div class="viewer">Bars: {{n_bars}}</div>\
                <button class="add btn" @click="if(n_bars<4){n_bars++; addBar()}"> + </button>\
                <button class="add btn" @click="if(n_bars>1){n_bars--}"> - </button>\
            </div>\
            <controller-component\
                @newLayerEvent="addLayer"\
                @bpmEvent="updateBPM"\
                @playAllEvent="playAll"\
                @stopAllEvent="stopAll"\
                @instSelectionEvent="instSelected"\
                @unifiedControllerEvent="unifiedControl=!unifiedControl"\
                @durationEvent="changeDuration"\
            ></controller-component>\
            \
            <div v-if="unifiedControl" class="layer-controller unified">\
                <key-selector-component\
                    @keySelectedEvent="printKey">\
                </key-selector-component>\
                <scale-selector-component\
                    @scaleSelectedEvent="printScale">\
                </scale-selector-component>\
                <div class="octave-sound-controller">\
                    <div id="octave-selector">\
                        <div class="octave-viewer">Octave: {{octave}} </div>\
                        <button class="layer-btn" @click="moreOctave"> + </button>\
                        <button class="layer-btn" @click="lessOctave"> - </button>\
                    </div>\
                    <div class="layer-sound-controller">\
                        <button class="layer-btn prelisten-btn" :class="{ prelistenActive : prelistenSystem }" @click="prelistenSystem=!prelistenSystem">L</button>\
                        <button class="layer-btn mute-btn" :class="{ muteActive : sequencerMuted }" @click="sequencerMuted=!sequencerMuted">M</button>\
                        <button class="layer-btn clear-btn" @click="clearSystem">C</button>\
                    </div>\
                </div>\
            </div>\
            \
            <div id="layers-container">\
                <layer-component v-for="(layer,index) in layers"\
                    ref="layers_refs"\
                    :key="layer.id"\
                    :num_beats="layer.num_beats"\
                    :total_duration="total_duration"\
                    :inst_id="inst_id"\
                    :n_bars="n_bars"\
                    :prelistenLayer="prelistenSystem"\
                    :layerMuted="sequencerMuted"\
                    :unifiedControl="unifiedControl"\
                    :duration="duration"\
                    @remove="layers.splice(index,1)"\
                    @addKeyEvent="if(!systemPlaying && layer.num_beats < 12 )layer.num_beats++"\
                    @removeKeyEvent="if(!systemPlaying && layer.num_beats > 1 )layer.num_beats--"\
                    @restartEvent="restart(index)"\
                ></layer-component>\
            </div>\
        </div>\
    ',
    
    components: {
        'layer-component' : layerComponent,
        'controller-component' : controllerComponent,
        'key-selector-component' : keySelectorComponent,
        'scale-selector-component' : scaleSelectorComponent,

    },
    
    data(){
        return {
            systemPlaying: false,
            unifiedControl: true,
            octave: 4,
            prelistenSystem: true,
            sequencerMuted: false,
            bpm: 120,
            nextId: 2,
            inst_id: 1,
            layers: [
                {
                    id: 0,
                    num_beats: 3,
                },
                {
                    id: 1,
                    num_beats: 2,
                },
            ],
            inst_id: 1,
            inst_name: ['nome_strumento1','nome_strumento2','drum: TR-808'], /*mettere nomi degli strumenti*/
            n_bars:1,
            duration:["16n","16n"]
        }
    },

    computed: {
        total_duration() {
            if(this.layers[0]){
                return this.layers[0].num_beats*60000/this.bpm;
            }
        }
    },

    methods: {
        addLayer(num_beats_input) {
            if(num_beats_input > 12) num_beats_input = 12;
            this.layers.push(
                {   
                    id: this.nextId,
                    num_beats: num_beats_input
                }
            )
            this.nextId += 1
        },
        updateBPM(bpm_input) {
            this.bpm = bpm_input
        },
        /** l'uso di $ref non è dinamico, quindi se aggiungo layer quando sto suonando l'ultimo layer non parte */
        playAll() {
            this.systemPlaying = true
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].isPlaying = 0
            }
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].play()
            }
        },
        stopAll() {
            this.systemPlaying = false
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].stop()
            }
        },
        restart(index) {
            if(index==0){
                console.log("Restart")
                this.playAll();
            }
        },
        instSelected(inst_id) {
            this.inst_id=inst_id
        },
        muteSystem() {
            this.layerMuted=!this.layerMuted
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].layerMuted = this.sequencerMuted;
            }
        },
        clearSystem() {
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].clearLayer();
            }
        },
        addBar(){
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].addLBar()
            }
        },
        printKey(num_key){
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].printKey(num_key);
            }
        },
        printScale(num_scale){
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].printScale(num_scale);
            }
        },
        moreOctave(){
            this.octave++;
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].moreOctave()
            }
        },
        lessOctave(){
            this.octave--;
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].lessOctave()
            }
        },
        changeDuration(inst_id,duration){
            this.duration[inst_id-1]=20-duration*4+"n"
        }
    }
}

var app = new Vue({
    el:'#app',
    components: {
        'sequencer-component': sequencerComponent
    }
})

var synth1 = new Tone.PolySynth(Tone.AMSynth).toDestination();
    synth1.set({
        harmonicity : 1 ,
        detune : 0 ,
        oscillator : {
        type : "sawtooth"
        } ,
        envelope : {
        attack : 0.01 ,
        decay : 0.1 ,
        sustain : 0.3 ,
        release : 0.07
        } ,
        modulation : {
        type : "pulse"
        } ,
        modulationEnvelope : {
        attack : 0.5 ,
        decay : 0 ,
        sustain : 0.5 ,
        release : 0.07
        }
        });
var synth2 = new Tone.PolySynth(Tone.DuoSynth).toDestination();
    synth2.set({
        vibratoAmount  : 0.5 ,
        vibratoRate  : 5 ,
        harmonicity  : 1.5 ,
        voice0  : {
        volume  : -10 ,
        portamento  : 0 ,
        oscillator  : {
        type  : "pulse"
        }  ,
        filterEnvelope  : {
        attack  : 0.01 ,
        decay  : 0 ,
        sustain  : 0.5 ,
        release  : 0.1
        }  ,
        envelope  : {
        attack  : 0.005 ,
        decay  : 0.1 ,
        sustain  : 0.3 ,
        release  : 0.07
        }
        }  ,
        voice1  : {
        volume  : -10 ,
        portamento  : 0 ,
        oscillator  : {
        type  : "square"
        }  ,
        filterEnvelope  : {
            attack  : 0.01 ,
            decay  : 0 ,
            sustain  : 0.5 ,
            release  : 0.1
        }  ,
        envelope  : {
        attack  : 0.005 ,
        decay  : 0.1 ,
        sustain  : 0.3 ,
        release  : 0.07
        }
        }
        });

/*--------Firestore config for drum-----------*/
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB23PkWGtyU3LFIYBy8uiKT0RM9gUYrkXk",
  authDomain: "actam21.firebaseapp.com",
  projectId: "actam21",
  storageBucket: "actam21.appspot.com",
  messagingSenderId: "745216869995",
  appId: "1:745216869995:web:7ad950861a786b73b8d32e",
  measurementId: "G-N1VC6LWMBM"
};

const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);

var drum = Array(8);
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_KICK_01_CLEAN_CFC.wav')).then(function(url) {
        drum[0] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_SNARE_01_CLEAN_CFC.wav')).then(function(url) {
        drum[1] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_TOM_HIGH_CLEAN_CFC.wav')).then(function(url) {
        drum[2] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_TOM_MID_CLEAN_CFC.wav')).then(function(url) {
        drum[3] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_H-CL_CLEAN_CFC.wav')).then(function(url) {
        drum[4] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_H-OH_CLEAN_CFC.wav')).then(function(url) {
        drum[5] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_CYM_01_CLEAN_CFC.wav')).then(function(url) {
        drum[6] = new Tone.Player(url).toDestination();
    })
    getDownloadURL(ref(storage,'gs://actam21.appspot.com/808_COW_CLEAN_CFC.wav')).then(function(url) {
        drum[7] = new Tone.Player(url).toDestination();
    })
