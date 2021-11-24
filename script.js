import Vue from "node_modules/vue/dist/vue.min.js"
import * as Tone from "tone"

var app = new Vue({
    el: '#app',
    data: {
        pads: [true, true, false, true],
        beatIndex: 0
    },
    methods: {
        toggleActive: function(i) {
            Vue.set(this.pads, i, !this.pads[i])
        },

        nextBeat: function() {
            this.beatIndex = (this.beatIndex + 1) % this.pads.length;
            if(this.pads[this.beatIndex]) {
                player.start()
            }
        }

    }
})

global.app = app