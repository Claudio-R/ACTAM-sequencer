/** TODO
 * 1. check dynamic update of bpm --UPDATE NON NE VENGO A CAPO
 * 2. check if slider visualization now works --FOLDATO NON è IMPORTANTE PER IL MOMENTO
 * 4. provare a gestire key e scale con v-model -- UPDATE CREATA VARIABILE
 * 3. sistemare pulsanti ed essere sicuri che lo stato venga preservato quando cambio il controller
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
                <div class="inst-menu-container"\
                    @mouseover="menu=true"\
                    @mouseleave="menu=false">\
                    <div class="inst-menu"\
                        v-show="menu">\
                            <label>Volume:<label>\
                            <input type="range" min="-40" max="3" class="slider" v-model="volume"></input>\
                            <div v-if="id!=3">\
                            <label>Duration:<label>\
                            <input type="range" min="0" max="4" class="slider" v-model="duration"></input>\
                            </div>\
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
            var activeCSScolors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)']
            var passiveCSScolors = ['rgb(120, 0, 0)','rgb(0, 0, 120)','rgb(0, 120, 0)']
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
            <div class="btn-1" @click="$emit(\'playAllEvent\')">▶</div>\
            <div class="btn-1 st" @click="$emit(\'stopAllEvent\')">■</div>\
            <input class="text-input border" type="number" v-model="newInput" placeholder="Add a layer" @keyup.enter="addLayer">\
            <input class="text-input border" type="number" v-model="bpm_value" placeholder="Select bpm" @keyup.enter="updateBPM">\
            <button class="unif"  @click="$emit(\'unifiedControllerEvent\')">Unify controller</button>\
            <fieldset>\
                <legend>instrument</legend>\
            </fieldset>\
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

    props: ['selectedScale'],

    data() {
        return {
            //selectedScale: 'Major',
            scales: ['Major','Minor','Melodic Minor','Harmonic Minor','Diminished','Augmented','Hexatonic'],
        }
    },

    methods: {
        selectScale(scale) {
            //this.selectedScale = scale;
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

    props: ['selectedKey'],

    data() {
        return {
            keys: ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],
        }
    },

    methods: {
        selectKey(note) {
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
        keyId: {type: Number },
        beatId: { type: Number },
        inst_selected:{ type: Number },
        prelistenBeat: { type: Boolean, default: true},
        muteBeat: { type: Boolean, default: true},
        muteLayer: { type: Boolean, default: true},
        isPlaying: { type: Number },        
    },

    data() {
        return {    
            state1: false,
            state2: false,
            state3: false,
            last_color: 0,
            very_last_color: 0,
        }
    },
    
    watch: {
        'isPlaying': function() {
            if(!this.muteBeat && this.isPlaying == this.beatId) { 
                this.playKey();
            } 
        }
    },

    computed: {
       cssVars() {
           var CSScolors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)'] /* Modifica qui i colori degli strumenti*/
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
                    if(!this.muteBeat && this.prelistenBeat && this.state1){
                        this.$emit('playSound1Event',this.keyId)
                    } break;
                case 2: 
                    this.state2 = !this.state2
                    if(!this.muteBeat && this.prelistenBeat && this.state2){
                        this.$emit('playSound2Event',this.keyId)
                    } break; 
                case 3: 
                    this.state3 = !this.state3
                    if(!this.muteBeat && this.prelistenBeat && this.state3){
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
                :keyId=tonesInScale-k\
                :beatId="beatId"\
                :inst_selected="inst_selected"\
                :prelistenBeat="prelistenBeat"\
                :muteBeat="muteBeat"\
                :muteLayer="muteLayer"\
                :isPlaying="isPlaying"\
                @playSound1Event="playInst1"\
                @playSound2Event="playInst2"\
                @playSound3Event="playInst3"\
            ></key-component>\
            <div id="beat-controller">\
                <button class="beat pplay" @click="for(var idx=0; idx<tonesInScale; idx++) { $refs.keys_refs[idx].playKey() }"></button>\
                <button class="beat mute" :class="{ muteActive : muteBeat }" @click="muteBeat=!muteBeat"></button>\
                <button class="beat clear" @click="clearAllKeys"></button>\
            </div>\
        </div>\
    ',

    components : {
        'key-component' : keyComponent,
    },

    props : ['beatId','inst_selected','duration','prelistenBeat','muteLayer','isPlaying','tonesInScale','scale_keyboard'],
    
    data() {
        return {
            muteBeat: false,
        }
    },

    watch: {
        'muteLayer' : function(val) {
            this.muteBeat = val;
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
            <div class="layer-labels" ref="labelsbox">\
                <div v-if="inst_id==3">\
                    <p class="key-label" v-for="k in tonesInScale">{{drum_keyboard[tonesInScale-k]}}</p>\
                </div>\
                <div v-else>\
                    <p class="key-label" v-for="k in tonesInScale">{{scale_keyboard[tonesInScale-k].slice(0, -1)}}</p>\
                </div>\
                <button id="remove-btn" class="btr" @click="$emit(\'removeLayerEvent\')">Remove layer</button>\
            </div>\
            \
            <div v-for="j in n_bars">\
                <div class="keyboard">\
                    <column-component v-for="k in num_beats"\
                        class="column" :style="cssVars"\
                        ref = beats_refs\
                        :class="{playing : k*j-(k-num_beats)*(j-1) === isPlaying + 1}"\
                        :beatId="k*j-1-(k-num_beats)*(j-1)"\
                        :inst_selected="inst_id"\
                        :duration="duration"\
                        :prelistenBeat="prelistenLayer"\
                        :muteLayer="muteLayer"\
                        :isPlaying="isPlaying"\
                        :tonesInScale="tonesInScale"\
                        :scale_keyboard="scale_keyboard"\
                    ></column-component>\
                </div>\
            </div>\
            \
            <div v-if="!unifiedControl" class="layer-controller" ref="controllerbox">\
                <div id="buttons">\
                    <button id="addKey-btn" class= "spin circle" @click="$emit(\'addKeyEvent\')"> + </button>\
                    <button id="removeKey-btn" class= "spin circle" @click="$emit(\'removeKeyEvent\')"> - </button>\
                </div>\
                <key-selector-component :selectedKey="keyLayer"\
                    @keySelectedEvent="function(val){$emit(\'keySelectedEvent\',val)}"\
                ></key-selector-component>\
                <scale-selector-component :selectedScale="scaleLayer"\
                    @scaleSelectedEvent="function(val){$emit(\'scaleSelectedEvent\',val)}"\
                ></scale-selector-component>\
                <div id="octave-selector">\
                    <div class="d little">\
                        <div class="v l">\
                            <span class="oct">octave:{{octaveLayer}}</span>\
                        </div>\
                    </div>\
                    <div class="dpad">\
                        <div class="up" @click="$emit(\'moreOctaveEvent\')"><span class="figureblock u"></span></div>\
                        <div class="down" @click="$emit(\'lessOctaveEvent\')"><span class="figureblock dd"> </span></div>\
                    </div>\
                </div>\
                <div class="layer-sound-controller">\
                    <button class=" beat pplay" :class="{ prelistenActive : prelistenLayer }" @click="$emit(\'togglePrelistenLayerEvent\')"></button>\
                    <button class="beat mute" :class="{ muteActive : muteLayer }" @click="$emit(\'toggleMuteLayerEvent\')"></button>\
                    <button class="beat clear" @click="clearLayer"></button>\
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
        /** sequencer controller */
        unifiedControl: Boolean,
        n_bars: Number,
        inst_id: Number,
        duration: Array,
        total_duration: Number,
        /** state variables */
        num_beats: Number,
        octaveLayer: Number,
        keyLayer: String,
        scaleLayer: String,
        prelistenLayer: Boolean,
        muteLayer: Boolean,
        window_width: Number

    },
    
    data() {
        return {
            isPlaying: -1,
            my_clock: '',
            tonesInScale: 8,
            keyboard: '',
            octave: 4,

            labels_width: null,
            controller_width: null
          
            scale_keyboard : ["C4","D4","E4","F4","G4","A4","B4","C5"],
            drum_keyboard : ["kick", "snare", "tom 1","tom 2","closed hh", "open hh", "ride","cowbell"],
        }
    },

    watch: {
        'isPlaying': function(val) {
            if(val==0){
                this.$emit('restartEvent');
            }
        },
        'unifiedControl': function() {
            this.$emit('unifyCalledEvent');
        }
            if(val==0){ this.$emit('restartEvent'); }
        },
        'keyLayer': function(val) {
            this.$emit('changedKeyEvent', val);
            this.keyboardCreator()
        },
        'scaleLayer': function(val) {
            this.$emit('changedScaleEvent', val);
            this.keyboardCreator()
        },
        'octaveLayer': function(val) {
            this.$emit('changedOctaveEvent', val);
            this.keyboardCreator()
        },
    },
    
    computed: {
        my_beat_duration() { return Number(this.total_duration/(this.num_beats)); },
        cssVars() {
            var layerWidth = this.window_width-this.labels_width-this.controller_width-28;
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
        next() { this.isPlaying = (this.isPlaying + 1) % (this.num_beats*this.n_bars); },
        stop() { clearInterval(this.my_clock) },
        play() {
            this.stop();
            this.my_clock = setInterval(this.next, this.my_beat_duration)
        },
        keyboardCreator(){
            this.keyboard = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"]
            this.keyboard = this.keyboard.map(ele => ele + this.octaveLayer)
            while(this.keyLayer + this.octaveLayer != this.keyboard[0]){
                first_element = this.keyboard.shift()
                first_element = first_element.slice(0, -1) + (this.octaveLayer+1)
                this.keyboard = this.keyboard.concat(first_element)
            }
            switch(this.scaleLayer){
                case 'Major': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2741 & (1 << index);
                });/*101010110101 and reversed = 2741*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                break;
                case 'Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1453 & (1 << index);
                });/*101101011010 and reversed = 1453*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                break;
                case 'Melodic Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2733 & (1 << index);
                });/*101010101101 and reversed = 2733*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                break;
                case 'Harmonic Minor': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2477 & (1 << index);
                });/*100110101101 and reversed = 2477*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                break;
                case 'Diminished': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1755 & (1 << index);
                });/*110110110110 and reversed = 2925*/
                
                break;
                case 'Augmented': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 2457 & (1 << index);
                });/*10011011001 and reversed = 2457*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octaveLayer+1))
                break;
                case 'Hexatonic': this.scale_keyboard = this.keyboard.filter((value, index) => {
                    return 1365 & (1 << index);
                });/*101010101010 and reversed = 1365*/
                this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octaveLayer+1))
                this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octaveLayer+1))
                break;
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
        },
        getElementSizes(){
            this.labels_width=this.$refs.labelsbox.clientWidth+36;
            if(!this.unifiedControl)
            this.controller_width=this.$refs.controllerbox.clientWidth+8;
            else
            this.controller_width=0;
        }
    },
    mounted(){
        this.getElementSizes()
        this.$on('unifyCalledEvent', () => {
            Vue.nextTick(() =>{
                this.getElementSizes()
            })
        })
    },
};

let sequencerComponent = {

    template: '\
        <div>\
            <div id="upper-sticky-container" ref="upperbox">\
                <div class="d">\
                    <div class="v left">\
                        <span class="bpm">BPM: {{bpm}}</span>\
                    </div>\
                    <div class="v right">\
                        <span class="inst">Selected instrument: {{inst_name[inst_id-1]}}</span>\
                    </div>\
                </div>\
                <div class="barcont">\
                    <div class="bars view">Bars: {{n_bars}}</div>\
                    <button class="barminus" @click="if(n_bars>1){n_bars--}"> - </button>\
                    <button class="barplus" @click="if(n_bars<4){n_bars++; addBar()}"> + </button>\
                </div>\
            </div>\
            <div class="barcont">\
                <div class="bars view">Bars: {{n_bars}}</div>\
                <button class="barminus" @click="if(n_bars>1){n_bars--}"> - </button>\
                <button class="barplus" @click="if(n_bars<4){n_bars++; addBar()}"> + </button>\
            </div>\
            <div class="imagecontainer">\
                <div class="logo"></div>\
            </div>\
            \
            <controller-component\
                @unifiedControllerEvent="unifiedControl=!unifiedControl"\
                @newLayerEvent="addLayer"\
                @bpmEvent="updateBPM"\
                @instSelectionEvent="instSelected"\
                @durationEvent="changeDuration"\
                @playAllEvent="playAll"\
                @stopAllEvent="stopAll"\
            ></controller-component>\
            \
            <div v-if="unifiedControl" class="layer-controller unified">\
                <key-selector-component @keySelectedEvent="changeKey"\
                    :selectedKey="allLayersKey"\
                ></key-selector-component>\
                <scale-selector-component @scaleSelectedEvent="changeScale"\
                    :selectedScale="allLayersScale"\
                ></scale-selector-component>\
                <div class="octave-sound-controller">\
                <div id="octave-selector" class="repos">\
                    <div class="d little">\
                        <div class="v l">\
                            <span class="oct">octave:{{allLayersOctave}}</span>\
                        </div>\
                    </div>\
                    <div class="dpad">\
                        <div class="up" @click="moreOctave"><span class="figureblock u"></span></div>\
                        <div class="down" @click="lessOctave"><span class="figureblock dd"> </span></div>\
                    </div>\
                </div>\
                    <div class="layer-sound-controller uni">\
                        <button class="pplay un" :class="{ prelistenActive : prelistenSystem }" @click="togglePrelistenSystem"></button>\
                        <button class="mute un" :class="{ muteActive : muteSystem }" @click="toggleMuteSystem"></button>\
                        <button class="clear un" @click="clearSystem"></button>\
                    </div>\
                        <div class="layer-sound-controller uni">\
                            <button class="pplay un" :class="{ prelistenActive : prelistenSystem }" @click="prelistenSystem=!prelistenSystem"></button>\
                            <button class="mute un" :class="{ muteActive : sequencerMuted }" @click="sequencerMuted=!sequencerMuted"></button>\
                            <button class="clear un" @click="clearSystem"></button>\
                        </div>\
                </div>\
            </div>\
            \
            <div id="layers-container">\
                <layer-component v-for="(layer,index) in layers"\
                    ref="layers_refs"\
                    :unifiedControl="unifiedControl"\
                    :n_bars="n_bars"\
                    :inst_id="inst_id"\
                    :duration="duration"\
                    :window_width="window_width"\
                    :total_duration="total_duration"\
                    :key="layer.id"\
                    :num_beats="layer.num_beats"\
                    :octaveLayer="layer.octaveLayer"\
                    :keyLayer="layer.keyLayer"\
                    :scaleLayer="layer.scaleLayer"\
                    :prelistenLayer="layer.prelistenLayer"\
                    :muteLayer="layer.muteLayer"\
                    @restartEvent="restart(index)"\
                    @removeLayerEvent="layers.splice(index,1)"\
                    @addKeyEvent="if(!systemPlaying && layer.num_beats < 12 ) layer.num_beats++"\
                    @removeKeyEvent="if(!systemPlaying && layer.num_beats > 1 ) layer.num_beats--"\
                    @keySelectedEvent="function(val) {layer.keyLayer = val}"\
                    @scaleSelectedEvent="function(val) {layer.scaleLayer = val}"\
                    @moreOctaveEvent="if(layer.octaveLayer < 6) layer.octaveLayer++"\
                    @lessOctaveEvent="if(layer.octaveLayer > 2) layer.octaveLayer--"\
                    @togglePrelistenLayerEvent="layer.prelistenLayer = !layer.prelistenLayer"\
                    @toggleMuteLayerEvent="layer.muteLayer = !layer.muteLayer"\
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
            /** sequencer controller */
            systemPlaying: false,
            bpm: 120,
            unifiedControl: true,
            n_bars:1,
            inst_id: 1,
            duration:["16n","16n"],
            
            /** unified controller */
            allLayersOctave: 4,
            allLayersKey: 'C',
            allLayersScale: 'Major',
            prelistenSystem: true,
            muteSystem: false,
            inst_name: ['nome_strumento1','nome_strumento2','drum: TR-808'],
            
            /** state variables */
            nextId: 2,
            layers: [
                {
                    id: 0,
                    num_beats: 3,
                    octaveLayer: 4,
                    keyLayer: 'C',
                    scaleLayer: 'Major',
                    prelistenLayer: true,
                    muteLayer: false,
                },
                {
                    id: 1,
                    num_beats: 2,
                    octaveLayer: 4,
                    keyLayer: 'C',
                    scaleLayer: 'Major',
                    prelistenLayer: true,
                    muteLayer: false,
                },
            ],
            inst_id: 1,
            inst_name: ['nome_strumento1','nome_strumento2','drum: TR-808'], /*mettere nomi degli strumenti*/
            n_bars:1,
            duration:["16n","16n"],
            window_width: null
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
        /** sequencer controller */
        addLayer(num_beats_input) {
            if(num_beats_input > 12) num_beats_input = 12;
            this.layers.push(
                {   
                    id: this.nextId,
                    num_beats: num_beats_input,
                    octaveLayer: this.allLayersOctave,
                    keyLayer: this.allLayersKey,
                    scaleLayer: this.allLayersScale,
                    prelistenLayer: this.prelistenSystem,
                    muteLayer: this.muteSystem,
                }
            )
            this.nextId += 1;
        },
        updateBPM(bpm_input) {
            this.bpm = bpm_input
        },
        addBar(){
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].addLBar()
            }
        },
        instSelected(inst_id) {
            this.inst_id=inst_id
        },
        changeDuration(inst_id,duration){
            this.duration[inst_id-1]=20-duration*4+"n"
        },
        playAll() {
            this.systemPlaying = true;
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

        /** unified controller */
        changeKey(num_key){
            this.allLayersKey = num_key;
            for(idx in this.layers) {
                this.layers[idx].keyLayer = this.allLayersKey;
            }
        },
        changeScale(num_scale){
            this.allLayersScale = num_scale;
            for(idx in this.layers) {
                this.layers[idx].scaleLayer = this.allLayersScale;
            }
        },
        moreOctave(){
            if(this.allLayersOctave < 6){ 
                this.allLayersOctave++;
                for(idx in this.layers) {
                    this.layers[idx].octaveLayer = this.allLayersOctave;
                }
            }
        },
        lessOctave(){
            if(this.allLayersOctave > 2){
                this.allLayersOctave--;
                for(idx in this.layers) {
                    this.layers[idx].octaveLayer = this.allLayersOctave;
                    //this.$refs.layers_refs[idx].lessOctave()
                }
            }
        },
        togglePrelistenSystem() { 
            this.prelistenSystem = !this.prelistenSystem;
            for(idx in this.layers) { 
                this.layers[idx].prelistenLayer = this.prelistenSystem; 
            }
        },
        toggleMuteSystem() { 
            this.muteSystem = !this.muteSystem;
            for(idx in this.layers) { 
                this.layers[idx].muteLayer = this.muteSystem; 
            }
        },
        clearSystem() {
            for(idx in this.layers) {
                this.$refs.layers_refs[idx].clearLayer();
            }
        },
        changeDuration(inst_id,duration){
            this.duration[inst_id-1]=20-duration*4+"n"
        },
        resized(){
                this.window_width=this.$refs.upperbox.clientWidth
        }
    },
    mounted() {
        this.window_width=this.$refs.upperbox.clientWidth
        window.addEventListener('resize', this.resized)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resized)
    },
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
