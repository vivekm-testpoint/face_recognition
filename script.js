
const BASE_URL = '/face_recognition';

const player = document.getElementById('player');
const canvas_c = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const trainButton = document.getElementById('train');
let labeledFaceDescriptors = [];

const constraints = {
    video: true,
};

// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        player.srcObject = stream;
    });

const video = document.getElementById('player');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri(BASE_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(BASE_URL),
  faceapi.nets.ssdMobilenetv1.loadFromUri(BASE_URL)
]).then(start);

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  
  let image;
  let canvas;

  captureButton.addEventListener('click', async () => {
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas_c.width, canvas_c.height);

    canvas_c.toBlob(async function(blob) {
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(blob)
      // container.append(image)
      canvas = faceapi.createCanvasFromMedia(image)
      // container.append(canvas)
      let displaySize = { width: image.width, height: image.height }
      faceapi.matchDimensions(canvas, displaySize)
      let detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
      let resizedDetections = faceapi.resizeResults(detections, displaySize)

      let faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
      let results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

      var matched = 0;
      var name = 0;
      results.forEach((result, i) => {

        matched = 1;
        name = result.label;
      });

      if (matched === 1 && name != 'unknown') {
        console.log('MATCH');
        console.log('name: ', name);

        document.getElementById('address-message').innerText = 'Hello ' + name + ', Have a nice day!';

      } else {
        console.log('NO MATCH');
        document.getElementById('address-message').innerText = 'Sorry not able to recognise!';

      }
    });
  });

    let objectStore = db.transaction("images").objectStore("images");
    let idb_images = [];
            
    objectStore.openCursor().onsuccess = async function(event) {
       let cursor = event.target.result;
       
       if (cursor) {
            idb_images.push({"label": cursor.value.label, "image": cursor.value.image})
            cursor.continue();
       } else {
          console.log(idb_images);
          load_idb_images();
       }
    };

    async function load_idb_images() {
        let count = 0;
        let length = idb_images.length;
        idb_images.forEach(async (image_data) => {

            let descriptions = [];
            let label = image_data.label;
            let image = await faceapi.bufferToImage(image_data.image)
            let detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor)

            let descriptor = new faceapi.LabeledFaceDescriptors(label, descriptions);
            labeledFaceDescriptors.push(descriptor);

            count++;
            if (count == length) { document.getElementById('main-container').style.display = 'block'; document.getElementById('loading-container').style.display = 'none'; }
            console.log(labeledFaceDescriptors);
        });

        if (idb_images.length == 0) { document.getElementById('main-container').style.display = 'block'; document.getElementById('loading-container').style.display = 'none'; }
    }

  trainButton.addEventListener('click', async () => {
    
    let label = document.getElementById('label').value;
    if (label.trim() == '') { alert('Please provide a label'); return; }

    trainButton.innerText = "Training...";
    
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas_c.width, canvas_c.height);

    canvas_c.toBlob(async function(blob) {
        let descriptions = [];
        
        let image = await faceapi.bufferToImage(blob)
        
        let detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)

        let descriptor = new faceapi.LabeledFaceDescriptors(label, descriptions);
        labeledFaceDescriptors.push(descriptor);

        let request = db.transaction(["images"], "readwrite")
            .objectStore("images")
            .add({label: label, image: blob});
            
        request.onsuccess = function(event) {
           console.log('Image data added to idb');
        };
        
        request.onerror = function(event) {
           console.log('Error adding image data to idb', event);
        }
        trainButton.innerText = "Train";
    });
  });
}
