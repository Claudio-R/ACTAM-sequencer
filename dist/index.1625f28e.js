/** TODO
 * 1. check dynamic update of bpm --UPDATE NON NE VENGO A CAPO
 * 2. check if slider visualization now works --FOLDATO NON è IMPORTANTE PER IL MOMENTO
 * 4. provare a gestire key e scale con v-model -- UPDATE CREATA VARIABILE
*/ Vue.config.devtools = true;
let instSelComponent = {
    template: '\
            <div class="inst_sel"\
                @click="instSelection"\
                :style="cssVars">\
           </div>\
    ',
    props: {
        id: {
            type: Number
        },
        selected_inst: {
            type: Number
        }
    },
    methods: {
        instSelection () {
            this.state = true;
            this.$emit('instSelectionEvent', this.id);
        }
    },
    computed: {
        cssVars () {
            activeCSScolors = [
                'rgb(255, 0, 0)',
                'rgb(0, 0, 255)',
                'rgb(0, 255, 0)'
            ];
            passiveCSScolors = [
                'rgb(120, 0, 0)',
                'rgb(0, 0, 120)',
                'rgb(0, 120, 0)'
            ];
            if (this.id == this.selected_inst) return {
                '--inst_sel_color': activeCSScolors[this.id - 1],
                '--inst_sel_border': '0px'
            };
            return {
                '--inst_sel_color': passiveCSScolors[this.id - 1],
                '--inst_sel_border': '2px'
            };
        }
    }
};
let controllerComponent = {
    template: '\
       <div class="controller">\
            <input class="text-input" type="number" v-model="newInput" placeholder="Add a layer (press enter)" @keyup.enter="addLayer">\
            <input class="text-input" type="number" v-model="bpm_value" placeholder="Select bpm (press enter)" @keyup.enter="updateBPM">\
            <button class="btn-1" @click="$emit(\'playAllEvent\')">Play</button>\
            <button class="btn-1" @click="$emit(\'stopAllEvent\')">Stop</button>\
            <label>Instrument:</label>\
            <inst-component v-for="k in num_inst"\
                :id="k"\
                :selected_inst=selected_inst\
                @instSelectionEvent="instSelection">\
            </inst-component>\
        </div>\
    ',
    components: {
        'inst-component': instSelComponent
    },
    props: {
        id: {
        },
        selected_inst: {
            default: 1
        }
    },
    data () {
        return {
            newInput: '',
            bpm_value: '',
            num_inst: 3
        };
    },
    computed: {
        newInput_toNumber () {
            return this.newInput ? parseInt(this.newInput) : null;
        },
        bpm_value_toNumber () {
            return this.bpm_value ? parseInt(this.bpm_value) : null;
        }
    },
    methods: {
        addLayer () {
            this.$emit('newLayerEvent', this.newInput_toNumber);
            this.newInput = '';
        },
        updateBPM () {
            this.$emit('bpmEvent', this.bpm_value_toNumber);
            this.bpm_value = '';
        },
        instSelection (inst_id) {
            this.$emit('instSelectionEvent', inst_id);
            this.selected_inst = inst_id;
        }
    }
};
let menuElementcomponent = {
    template: '<div @click="$emit(\'selectionEvent\', element)"> {{ element }} </div>',
    props: [
        'element'
    ]
};
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
        'menu-element-component': menuElementcomponent
    },
    data () {
        return {
            selectedScale: 'Major',
            scales: [
                'Major',
                'Minor',
                'Melodic Minor',
                'Harmonic Minor',
                'Diminished',
                'Augmented',
                'Hexatonic'
            ]
        };
    },
    methods: {
        selectScale (scale) {
            this.selectedScale = scale;
            this.$emit('scaleSelectedEvent', scale);
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
        'menu-element-component': menuElementcomponent
    },
    data () {
        return {
            selectedKey: 'C',
            keys: [
                'C',
                'Db',
                'D',
                'Eb',
                'E',
                'F',
                'Gb',
                'G',
                'Ab',
                'A',
                'Bb',
                'B'
            ]
        };
    },
    methods: {
        selectKey (note) {
            this.selectedKey = note;
            this.$emit('keySelectedEvent', note);
        }
    }
};
let keyComponent = {
    template: '\
        <div @click="toggleActive">\
            <div class="key"\
                :class="{active : state1 || state2 || state3}"\
                :style="cssVars">\
            </div>\
        </div>\
    ',
    props: {
        beatId: {
            type: Number
        },
        keyId: {
            type: Number
        },
        state1: {
            default: false
        },
        state2: {
            default: false
        },
        state3: {
            default: false
        },
        beatMuted: {
            type: Boolean,
            default: false
        },
        isPlaying: {
            type: Number
        },
        inst_selected: {
            type: Number
        },
        last_color: {
            type: Number,
            default: 0
        },
        very_last_color: {
            type: Number,
            default: 0
        }
    },
    watch: {
        'isPlaying': function() {
            if (!this.beatMuted && this.isPlaying == this.beatId) this.playKey();
        }
    },
    computed: {
        cssVars () {
            CSScolors = [
                'rgb(255, 0, 0)',
                'rgb(0, 0, 255)',
                'rgb(0, 255, 0)'
            ];
            /* Modifica qui i colori degli strumenti*/ if (this.state1 && this.state2 && this.state3) return {
                '--inst_color': CSScolors[3 - this.very_last_color - this.last_color],
                '--shadow': '-7px 0 ' + CSScolors[this.very_last_color] + ',-14px 0 ' + CSScolors[this.last_color],
                '--inst_shift': '7px'
            };
            if (this.state1 && this.state2) {
                this.very_last_color = Math.abs(this.last_color - 1);
                return {
                    '--inst_color': CSScolors[this.very_last_color],
                    '--shadow': '-7px 0 ' + CSScolors[this.last_color],
                    '--inst_shift': '3.5px'
                };
            }
            if (this.state2 && this.state3) {
                this.very_last_color = Math.abs(this.last_color - 3);
                return {
                    '--inst_color': CSScolors[this.very_last_color],
                    '--shadow': '-7px 0 ' + CSScolors[this.last_color],
                    '--inst_shift': '3.5px'
                };
            }
            if (this.state1 && this.state3) {
                this.very_last_color = Math.abs(this.last_color - 2);
                return {
                    '--inst_color': CSScolors[this.very_last_color],
                    '--shadow': '-7px 0 ' + CSScolors[this.last_color],
                    '--inst_shift': '3.5px'
                };
            }
            if (this.state1) {
                this.last_color = 0;
                return {
                    '--inst_color': CSScolors[0],
                    '--inst_shift': '0px'
                };
            } else if (this.state2) {
                this.last_color = 1;
                return {
                    '--inst_color': CSScolors[1],
                    '--inst_shift': '0px'
                };
            } else if (this.state3) {
                this.last_color = 2;
                return {
                    '--inst_color': CSScolors[2],
                    '--inst_shift': '0px'
                };
            }
        }
    },
    methods: {
        toggleActive () {
            switch(this.inst_selected){
                case 1:
                    this.state1 = !this.state1;
                    if (!this.beatMuted && this.state1) this.$emit('playSound1Event', this.keyId);
                    break;
                case 2:
                    this.state2 = !this.state2;
                    if (!this.beatMuted && this.state2) this.$emit('playSound2Event', this.keyId);
                    break;
                case 3:
                    this.state3 = !this.state3;
                    if (!this.beatMuted && this.state3) this.$emit('playSound3Event', this.keyId);
                    break;
            }
        },
        playKey () {
            if (this.state1) this.$emit('playSound1Event', this.keyId);
            if (this.state2) this.$emit('playSound2Event', this.keyId);
            if (this.state3) this.$emit('playSound3Event', this.keyId);
        },
        clearKey () {
            if (this.state1) this.state1 = !this.state1;
            if (this.state2) this.state2 = !this.state2;
            if (this.state3) this.state3 = !this.state3;
        }
    }
};
let beatControllerComponent = {
    template: '\
        <div id="beat-controller">\
            <button class="beat-btn" @click="$emit(\'monitorBeatEvent\')">P</button>\
            <button class="beat-btn" :class="{ muteActive : beatMuted }" @click="$emit(\'muteBeatEvent\')">M</button>\
            <button class="beat-btn" @click="$emit(\'clearBeatEvent\')">C</button>\
        </div>\
    ',
    props: [
        'beatMuted'
    ]
};
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
                :beatMuted=beatMuted\
                @playSound1Event="playInst1"\
                @playSound2Event="playInst2"\
                @playSound3Event="playInst3"\
            ></key-component>\
            <beat-controller-component\
                :beatMuted="beatMuted"\
                @monitorBeatEvent="for(var idx=0; idx<tonesInScale; idx++) { $refs.keys_refs[idx].playKey() }"\
                @muteBeatEvent="beatMuted = !beatMuted"\
                @clearBeatEvent="for(var idx=0; idx<tonesInScale; idx++) { $refs.keys_refs[idx].clearKey() }"\
            ></beat-controller-component>\
        </div>\
    ',
    components: {
        'key-component': keyComponent,
        'beat-controller-component': beatControllerComponent
    },
    props: [
        'beatId',
        'tonesInScale',
        "inst_selected",
        'isPlaying',
        'scale_keyboard'
    ],
    data () {
        return {
            beatMuted: false
        };
    },
    methods: {
        playInst1 (keyId) {
            synth1.triggerAttackRelease(this.scale_keyboard[keyId], "16n");
        },
        playInst2 (keyId) {
            synth2.triggerAttackRelease(this.scale_keyboard[keyId], "16n");
        },
        playInst3 (keyId) {
            synth3.triggerAttack(this.scale_keyboard[keyId]);
        }
    }
};
let layerComponent = {
    template: '\
        <div class="layer">\
            <div class="layer-labels">\
                <div v-if="inst_id==3">\
                    <p class="key-label" v-for="k in tonesInScale">{{drum_keyboard[tonesInScale-k]}}</p>\
                </div>\
                <div v-else>\
                    <p class="key-label" v-for="k in tonesInScale">{{scale_keyboard[tonesInScale-k].slice(0, -1)}}</p>\
                </div>\
            </div>\
            <div v-for="j in n_bars">\
                <div class="keyboard">\
                    <column-component v-for="k in num_beats"\
                        class="column" :style="cssVars"\
                        :class="{playing : k*j-(k-num_beats)*(j-1) === isPlaying + 1}"\
                        :beatId="k*j-1-(k-num_beats)*(j-1)"\
                        :isPlaying="isPlaying"\
                        :inst_selected="inst_id"\
                        :scale_keyboard="scale_keyboard"\
                        :tonesInScale="tonesInScale">\
                    </column-component>\
                </div>\
            </div>\
            <div class="layer-controller">\
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
                    <p class="octave-viewer">Octave: {{octave}}</p>\
                    <button id="addKey-btn" @click="moreOctave"> + </button>\
                    <button id="removeKey-btn" @click="lessOctave"> - </button>\
                </div>\
            </div>\
        </div>\
    ',
    components: {
        'column-component': columnComponent,
        'scale-selector-component': scaleSelectorComponent,
        'key-selector-component': keySelectorComponent,
        'beat-controller-component': beatControllerComponent
    },
    props: {
        num_beats: Number,
        total_duration: Number,
        inst_id: Number,
        n_bars: Number,
        key: {
            default: 'C'
        },
        scale: {
            default: 'Major'
        },
        scale_keyboard: {
            default: [
                "C4",
                "D4",
                "E4",
                "F4",
                "G4",
                "A4",
                "B4",
                "C5"
            ]
        },
        drum_keyboard: {
            default: [
                "kick",
                "snare",
                "tom 1",
                "tom 2",
                "closed hh",
                "open hh",
                "ride",
                "cowbell"
            ]
        }
    },
    data () {
        return {
            isPlaying: 0,
            my_clock: '',
            tonesInScale: 8,
            keyboard: '',
            octave: 4
        };
    },
    watch: {
        'isPlaying': function(val) {
            /*if(val==0) { this.play(); }*/ if (val == 0) this.$emit('restartEvent');
        }
    },
    computed: {
        beatPlaying () {
            return this.isPlaying;
        },
        my_beat_duration () {
            return Number(this.total_duration / this.num_beats);
        },
        cssVars () {
            var layerWidth = 500;
            var margin = 5;
            var borderKey = 3;
            var keyHeight = 18;
            var barWidth = 500;
            return {
                '--columnWidth': (layerWidth - this.num_beats * 2 * margin) / (this.num_beats * this.n_bars) + 'px',
                '--columnHeight': this.tonesInScale * (keyHeight + 2 * borderKey) + 'px',
                '--barWidth': barWidth / this.n_bars + 'px'
            };
        }
    },
    methods: {
        next () {
            this.isPlaying = (this.isPlaying + 1) % (this.num_beats * this.n_bars);
        },
        stop () {
            clearInterval(this.my_clock);
        },
        play () {
            this.stop();
            this.my_clock = setInterval(this.next, this.my_beat_duration);
        },
        printScale (num_scale) {
            console.log("Selected scale " + num_scale);
            this.scale = num_scale;
            this.keyboardCreator();
        },
        printKey (num_key) {
            console.log("Selected key " + num_key);
            this.key = num_key;
            this.keyboardCreator();
        },
        keyboardCreator () {
            this.keyboard = [
                "C",
                "Db",
                "D",
                "Eb",
                "E",
                "F",
                "Gb",
                "G",
                "Ab",
                "A",
                "Bb",
                "B"
            ];
            this.keyboard = this.keyboard.map((ele)=>ele + this.octave
            );
            while(this.key + this.octave != this.keyboard[0]){
                first_element = this.keyboard.shift();
                first_element = first_element.slice(0, -1) + (this.octave + 1);
                this.keyboard = this.keyboard.concat(first_element);
            }
            switch(this.scale){
                case 'Major':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 2741 & 1 << index;
                    }); /*101010110101 and reversed = 2741*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    break;
                case 'Minor':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 1453 & 1 << index;
                    }); /*101101011010 and reversed = 1453*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    break;
                case 'Melodic Minor':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 2733 & 1 << index;
                    }); /*101010101101 and reversed = 2733*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    break;
                case 'Harmonic Minor':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 2477 & 1 << index;
                    }); /*100110101101 and reversed = 2477*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    break;
                case 'Diminished':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 1755 & 1 << index;
                    }); /*110110110110 and reversed = 2925*/ 
                    break;
                case 'Augmented':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 2457 & 1 << index;
                    }); /*10011011001 and reversed = 2457*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octave + 1));
                    break;
                case 'Hexatonic':
                    this.scale_keyboard = this.keyboard.filter((value, index)=>{
                        return 1365 & 1 << index;
                    }); /*101010101010 and reversed = 1365*/ 
                    this.scale_keyboard.push(this.scale_keyboard[0].slice(0, -1) + (this.octave + 1));
                    this.scale_keyboard.push(this.scale_keyboard[1].slice(0, -1) + (this.octave + 1));
                    break;
            }
        },
        moreOctave () {
            this.octave++;
            this.keyboardCreator();
        },
        lessOctave () {
            this.octave--;
            this.keyboardCreator();
        }
    }
};
let sequencerComponent = {
    template: '\
        <div>\
            <div class="view-box">\
                <p class="viewer">BPM: {{bpm}}</p>\
                <p class="viewer">Selected instrument: {{inst_name[inst_id-1]}}</p>\
                <p class="viewer">Bars: {{n_bars}}</p>\
                <button id="remove-btn" @click="if(n_bars<4){n_bars++}"> + </button>\
                <button id="addKey-btn" @click="if(n_bars>1){n_bars--}"> - </button>\
            </div>\
            <controller-component\
                @newLayerEvent="addLayer"\
                @bpmEvent="updateBPM"\
                @playAllEvent="playAll"\
                @stopAllEvent="stopAll"\
                @instSelectionEvent="instSelected"\
            ></controller-component>\
            <div id="layers-container">\
                <layer-component v-for="(layer,index) in layers"\
                    ref="layers_refs"\
                    :key="layer.id"\
                    :num_beats="layer.num_beats"\
                    :total_duration="total_duration"\
                    :inst_id="inst_id"\
                    :n_bars="n_bars"\
                    @remove="layers.splice(index,1)"\
                    @addKeyEvent="layer.num_beats++"\
                    @removeKeyEvent="layer.num_beats--"\
                    @restartEvent="restart(index)"\
                ></layer-component>\
            </div>\
        </div>\
    ',
    components: {
        'layer-component': layerComponent,
        'controller-component': controllerComponent
    },
    data () {
        return {
            bpm: 120,
            nextId: 2,
            inst_id: 1,
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
            inst_name: [
                'nome_strumento1',
                'nome_strumento2',
                'nome_strumento3'
            ],
            /*mettere nomi degli strumenti*/ n_bars: 1
        };
    },
    computed: {
        total_duration () {
            if (this.layers[0]) return this.layers[0].num_beats * 60000 / this.bpm;
        }
    },
    methods: {
        addLayer (num_beats_input) {
            this.layers.push({
                id: this.nextId,
                num_beats: num_beats_input
            });
            this.nextId += 1;
        },
        updateBPM (bpm_input) {
            this.bpm = bpm_input;
        },
        /** l'uso di $ref non è dinamico, quindi se aggiungo layer quando sto suonando l'ultimo layer non parte */ playAll () {
            for(idx in this.layers)this.$refs.layers_refs[idx].isPlaying = 0;
            this.playing = true;
            for(idx in this.layers)this.$refs.layers_refs[idx].play();
        },
        stopAll () {
            for(idx in this.layers)this.$refs.layers_refs[idx].stop();
            this.playing = false;
        },
        restart (index) {
            if (index == 0) {
                console.log("Restart");
                this.playAll();
            }
        },
        instSelected (inst_id) {
            this.inst_id = inst_id;
        }
    }
};
var app = new Vue({
    el: '#app',
    components: {
        'sequencer-component': sequencerComponent
    }
});
var synth1 = new Tone.PolySynth().toDestination();
var synth2 = new Tone.DuoSynth({
    vibratoAmount: 0.5,
    vibratoRate: 5,
    harmonicity: 1.5,
    voice0: {
        volume: -10,
        portamento: 0,
        oscillator: {
            type: "sine"
        },
        filterEnvelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
        },
        envelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
        }
    },
    voice1: {
        volume: -10,
        portamento: 0,
        oscillator: {
            type: "sine"
        },
        filterEnvelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
        },
        envelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
        }
    }
}).toDestination();
var synth3 = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 8000,
    resonance: 0.9
}).toDestination();

//# sourceMappingURL=index.1625f28e.js.map
