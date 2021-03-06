/**
 * Various links
 * https://stackoverflow.com/questions/46882550/how-to-save-a-jpg-image-video-captured-with-webcam-in-the-local-hard-drive-with
 * http://fabricjs.com/freedrawing
 * https://github.com/fabricjs/fabric.js/tree/master/src
 * 
 * Notes:
 * - The fabric API seems to do what we want, but the documentation is hard to follow. I mostly had to look through their source to understand what I wanted to do
 * - Dimensions can be tricky.
 * 		- I wanted to capture a high res image, but shrink it enough for them to see on a mobile device
 * 		- They should be able to annotate, but annating on a shrunken image should not pixelate when saving a high res image
 * 		- I found the best way to do this is to set the dimensions of the canvas elements to the high res dimensions and use styling (width/height)
 * 		  to shrink the size. This retains the resolution, yet makes it small enough to see
 * 		- I also had to make sure the fabric containers match this same idea of a large canvas and smaller viewport. If everything lines up correctly, it
 * 		  appears to work!
 */

const MODE_VIDEO = 'VIDEO';
const MODE_CANVAS = 'CANVAS';
let mode = MODE_VIDEO;
let videoSupported = true;

let fabricCanvas;
let thumbnailX;
let thumbnailY;
let thumbnailWidth;
let thumbnailHeight;

//Capture image

function capture() {
	setMode(MODE_CANVAS);
	initAnnotations();

	if(videoSupported) {
		loadVideoImage();
	} else {
		loadTestImage();
	}

}

function loadTestImage() {
	let canvas = document.getElementById('thumbnail');
	let ctx = canvas.getContext('2d'); // get its context

	let url = './airplane.jpg';
	let image = new Image();
	image.src = url;
	
	image.onload = () => {
		info('drawing thumbnail');
		// let scale = Math.min(canvas.clientWidth / image.width, canvas.clientHeight / image.height);
		let scale = Math.min(500 / image.width, 500 / image.height);
		thumbnailWidth = image.width * scale;
		thumbnailHeight = image.height * scale;

		thumbnailX = (canvas.clientWidth / 2) - thumbnailWidth / 2;
		thumbnailY = (canvas.clientHeight / 2) - thumbnailHeight / 2;
	
		canvas.width = image.width;
		canvas.height = image.height;

		let canvasContainer = document.getElementById('canvasContainer');
		canvasContainer.style.width = `${thumbnailWidth}px`;
		canvasContainer.style.height = `${thumbnailHeight}px`;

		fabricCanvas.setDimensions({width: image.width, height: image.height});
		fabricCanvas.setDimensions({width: thumbnailWidth, height: thumbnailHeight}, {cssOnly: true});
		fabricCanvas.upperCanvasEl.style.zIndex = 2;

		ctx.drawImage(image, 0, 0, image.width, image.height);
	}
}

function loadVideoImage() {
	try {
		let vid = document.querySelector('video');
		
		info('drawing thumbnail');
		let canvas = document.getElementById('thumbnail');
		let ctx = canvas.getContext('2d'); // get its context
	
		canvas.width = vid.videoWidth;
		canvas.height = vid.videoHeight;
	
		// info(`canvas: ${canvas.width}, ${canvas.height}`);
		// info(`video: ${vid.videoWidth}, ${vid.videoHeight}`);
	
		let scale = Math.min(500 / vid.videoWidth, 500 / vid.videoHeight);
		thumbnailWidth = vid.videoWidth * scale;
		thumbnailHeight = vid.videoHeight * scale;
		thumbnailX = (canvas.width / 2) - thumbnailWidth / 2;
		thumbnailY = (canvas.height / 2) - thumbnailHeight / 2;
	
		// info(`scale: ${scale}`);
		// info(`new: ${thumbnailWidth}, ${thumbnailHeight}`);
		// info(`location: ${thumbnailX}, ${thumbnailY}`);
		
		let canvasContainer = document.getElementById('canvasContainer');
		canvasContainer.style.width = `${thumbnailWidth}px`;
		canvasContainer.style.height = `${thumbnailHeight}px`;
	
		fabricCanvas.setDimensions({width: vid.videoWidth, height: vid.videoHeight});
		fabricCanvas.setDimensions({width: thumbnailWidth, height: thumbnailHeight}, {cssOnly: true});
		fabricCanvas.upperCanvasEl.style.zIndex = 2;
	
		ctx.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight);
	} catch(error) {
		info(error);
	}
}

//Annotations

function initAnnotations() {
	try {
		if(fabricCanvas === undefined) {
			let canvas = document.getElementById('annotate');
			// let canvas = document.getElementById('thumbnail');
		
			fabricCanvas = new fabric.Canvas(canvas, {
				isDrawingMode: true
			});
	
			fabricCanvas.freeDrawingBrush.width = 10;
		}
	
		fabricCanvas.clear();
	} catch(error) {
		info(error);
	}
}

function clearCanvas() {
	fabricCanvas.clear();
}

//Misc buttons

function retake() {
	setMode(MODE_VIDEO);

	let canvas = document.getElementById('thumbnail');
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function download(blob){
	// uses the <a download> to download a Blob
	let a = document.createElement('a'); 
	a.href = URL.createObjectURL(blob);
	a.download = 'test.jpg';
	document.body.appendChild(a);
	a.click();
}

function setMode(newMode) {
	try {
		mode = newMode;
	
		let captureButton = document.getElementById('captureButton');
		let retakeButton = document.getElementById('retakeButton');
		let saveButton = document.getElementById('saveButton');
	
		captureButton.disabled = mode === MODE_CANVAS;
		retakeButton.disabled = mode === MODE_VIDEO;
		saveButton.disabled = mode === MODE_VIDEO;
	
		let video = document.getElementById('vid');
		let canvasContainer = document.getElementById('canvasContainer');
		let annotationButtons = document.getElementById('annotationButtons');
	
		video.style.display = mode === MODE_VIDEO ? 'block' : 'none';
		canvasContainer.style.display = mode === MODE_CANVAS ? 'inline-block' : 'none';
		annotationButtons.style.display = mode === MODE_CANVAS ? 'inline-block' : 'none';
	} catch(error) {
		info(error);
	}
}

async function save(){
	try {
		info('saving');
		// const canvas = document.createElement('canvas'); // create a canvas
		// const ctx = canvas.getContext('2d'); // get its context
		// let vid = document.querySelector('video');
		// canvas.width = vid.videoWidth; // set its size to the one of the video
		// canvas.height = vid.videoHeight;
		// ctx.drawImage(vid, 0,0); // the video

		// let canvas = document.getElementById('canvas');

		let annotateCanvas = document.getElementById('annotate');
		let thumbnailCanvas = document.getElementById('thumbnail');
		let ctx = thumbnailCanvas.getContext('2d');
		ctx.drawImage(annotateCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
		
		let blob = await new Promise((res, rej)=>{
			// let canvas = document.getElementById('thumbnail');
			// canvas.toBlob(res, 'image/jpeg');
			thumbnailCanvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
		});

		info('downloading');
		download(blob);
	} catch(error) {
		info(error);
	}
}

//Upload

function upload(input) {
	if (input.files) {
		let imagesDiv = document.getElementById('images');

		for(let i = 0; i < input.files.length; i++) {
			let imageDiv = document.createElement('img');
			imageDiv.id = `image${i}`;
			imageDiv.style = 'max-width: 200px; max-height: 150px;'
			imagesDiv.append(imageDiv);

			let reader = new FileReader();

			reader.onload = function (e) {
				imageDiv.src = e.target.result;
			};
			
			reader.readAsDataURL(input.files[i]);
		}
	}
}

function info(value) {
	document.getElementById('output').innerHTML += `${value}<br/>`;
}

async function init() {
	setMode(MODE_VIDEO);
	
	try {
		info('initing video');
		let options = {
			audio: false,
			video: {
				facingMode: 'environment',
				height: { min: 720, ideal: 1080 },
				width: { min: 1280, ideal: 1920 }
			}
		};

		let stream = await navigator.mediaDevices.getUserMedia(options); // request cam
		
		let vid = document.querySelector('video');
		vid.srcObject = stream; // don't use createObjectURL(MediaStream)
		await vid.play(); // returns a Promise
	} catch(error) {
		info(error);
		videoSupported = false;
	}
}

setTimeout(() => {
	init();
}, 10);