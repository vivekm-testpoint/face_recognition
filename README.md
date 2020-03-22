# face_recognition
Client side face recognition using faceapi.js and tensorflow.js

### Setup

- Download the repo files to your project root directory

- Update `index.html` and `script.js` files with the relative path for the project folder. For example, if path is /face_recognition: 

- index.html:
```html
...

<script defer src="/face_recognition/faceapi.js"></script>
<script defer src="/face_recognition/script.js"></script>

...
```

- script.js:
```html
...

const BASE_URL = '/face_recognition';

...
```

- Start a web server and open index page in browser. For example: `localhost/face_recognition/index.html`


### Usage

- If your are running the website for the first time, you need to train some images first. If you already trained some face images you dont need to train again. (Refer next section on how to train images)

- Training data is stored in indexedDB, so that you dont have to train again when you visit/refresh site next time

- All the image data is stored in the client side, nothing is sent to the server


### How to train face images

- Position your face so that it is centered in the canvas window. 
- Enter a name in the label input field and click on train button. Button text should change to "Training.." 
- When done, button text will change back to "Train". Switch to another person's face, change the label and train again
- Atleast train 3-4 times per person for better recognition.
- When done training, position any of the person from the training in front of the web cam and click on "Recognise" button. You should see respective label when succefully recognised or a message indicating that system couldn't recognise the person.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
