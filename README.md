# PoliX4

....inserire foto.....

## Introduction

PoliX4 is a polyrhythmic sequencer. It has been implemented with HTML, CSS and JavaScript. The GUI and the sounds emitted by the virtual application are freely inspired by GAME-BOY.  
It has the possibility to choose two synthetized instruments and a drum kit.....

## Installations required

In order to use this application, you need to install some packages.
npm (forse anche Node da installare) is a package manager for JavaScript and through it you install Vue, Tone.js, Parcel-bundler and Firebase by running the following lines of code in th shell:

```bash
npm install parcel-bundler
```

```bash
npm install firebase
```

```bash
npm install vue
```

```bash
npm install tone
```

The necessary code added in Javascript the configuration of the Firestore database in which are stored the samples of the drum kit.

```javascript
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
```

## Implementation

Vue is used as the framework of the project. The main component (in the HTML file da specificare?) is the sequencer component:

```html
  <div id="app">
        <sequencer-component></sequencer-component>
  </div>
```





