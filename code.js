/**
 * Various links
 * https://stackoverflow.com/questions/46882550/how-to-save-a-jpg-image-video-captured-with-webcam-in-the-local-hard-drive-with
 */

const MODE_VIDEO = 'VIDEO';
const MODE_CANVAS = 'CANVAS';
let mode = MODE_VIDEO;
let videoSupported = true;

let hiddenCanvas;
let fabricCanvas;
let thumbnailX;
let thumbnailY;
let thumbnailWidth;
let thumbnailHeight;

//Capture image

function capture() {
	setMode(MODE_CANVAS);

	if(videoSupported) {
		loadVideoImage();
	} else {
		loadTestImage();
	}

	initAnnotations();
}

function loadTestImage() {
	// hiddenCanvas = document.createElement('canvas'); // create a canvas
	hiddenCanvas = document.getElementById('hiddenCanvas');
	let hiddenContext = hiddenCanvas.getContext('2d'); // get its context

	let canvas = document.getElementById('thumbnail');
	let ctx = canvas.getContext('2d'); // get its context

	let url = './airplane.jpg';
	let image = new Image();
	image.src = url;
	
	image.onload = () => {
		info('capturing full image');
		hiddenCanvas.width = image.width;
		hiddenCanvas.height = image.height;
		hiddenContext.drawImage(image, 0, 0, image.width, image.height);

		info('drawing thumbnail');
		// let scale = Math.min(canvas.clientWidth / image.width, canvas.clientHeight / image.height);
		let scale = Math.min(300 / image.width, 300 / image.height);
		thumbnailWidth = image.width * scale;
		thumbnailHeight = image.height * scale;

		thumbnailX = (canvas.clientWidth / 2) - thumbnailWidth / 2;
		thumbnailY = (canvas.clientHeight / 2) - thumbnailHeight / 2;
	
		// ctx.drawImage(image, thumbnailX, thumbnailY, thumbnailWidth, thumbnailHeight);

		let canvasContainer = document.getElementById('canvasContainer');

		canvas.width = image.width;
		canvas.height = image.height;
		canvas.style.width = thumbnailWidth;
		canvas.style.height = thumbnailHeight;
		ctx.drawImage(image, 0, 0, image.width, image.height);

		canvasContainer.style.width = `${thumbnailWidth}px`;
		canvasContainer.style.height = `${thumbnailHeight}px`;

		fabricCanvas.upperCanvasEl.width = image.width;
		fabricCanvas.upperCanvasEl.height = image.height;
		fabricCanvas.upperCanvasEl.style.width = thumbnailWidth;
		fabricCanvas.upperCanvasEl.style.height = thumbnailHeight;

		fabricCanvas.wrapperEl.style.width = thumbnailWidth;
		fabricCanvas.wrapperEl.style.height = thumbnailHeight;
	}
}

function loadVideoImage() {
	let vid = document.querySelector('video');
	
	info('capturing full image');
	// hiddenCanvas = document.createElement('canvas'); // create a canvas
	hiddenCanvas = document.getElementById('hiddenCanvas');
	let hiddenContext = hiddenCanvas.getContext('2d'); // get its context
	hiddenCanvas.width = vid.videoWidth; // set its size to the one of the video
	hiddenCanvas.height = vid.videoHeight;
	hiddenContext.drawImage(vid, 0,0); // the video

	info('drawing thumbnail');
	let canvas = document.getElementById('thumbnail');
	let ctx = canvas.getContext('2d'); // get its context

	info(`canvas: ${canvas.width}, ${canvas.height}`);
	info(`video: ${vid.videoWidth}, ${vid.videoHeight}`);

	let scale = Math.min(canvas.width / vid.videoWidth, canvas.height / vid.videoHeight);
	thumbnailWidth = vid.videoWidth * scale;
	thumbnailHeight = vid.videoHeight * scale;
    thumbnailX = (canvas.width / 2) - thumbnailWidth / 2;
	thumbnailY = (canvas.height / 2) - thumbnailHeight / 2;

	info(`scale: ${scale}`);
	info(`new: ${thumbnailWidth}, ${thumbnailHeight}`);
	info(`location: ${thumbnailX}, ${thumbnailY}`);
    ctx.drawImage(vid, thumbnailX, thumbnailY, thumbnailWidth, thumbnailHeight);
}

//Annotations

function initAnnotations() {
	if(fabricCanvas === undefined) {
		// let canvas = document.getElementById('annotate');
		let canvas = document.getElementById('thumbnail');
	
		fabricCanvas = new fabric.Canvas(canvas, {
			isDrawingMode: true
		});

		fabricCanvas.freeDrawingBrush.width = 10;
	}

	fabricCanvas.clear();
}

function clearCanvas() {
	fabricCanvas.clear();
}

function copyCanvas() {
	try {
		let annotateCanvas = document.getElementById('annotate');
	
		let ctx = hiddenCanvas.getContext('2d');
		info(`thumbnail size: ${thumbnailWidth}, ${thumbnailHeight}`);
		info(`thumbnail location: ${thumbnailX}, ${thumbnailY}`);
		info(`hidden size: ${hiddenCanvas.width}, ${hiddenCanvas.height}`);
		ctx.drawImage(annotateCanvas, thumbnailX, thumbnailY, thumbnailWidth, thumbnailHeight, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
	} catch(error) {
		info(error);
	}
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
	mode = newMode;

	let captureButton = document.getElementById('captureButton');
	let retakeButton = document.getElementById('retakeButton');
	let saveButton = document.getElementById('saveButton');

	captureButton.disabled = mode === MODE_CANVAS;
	retakeButton.disabled = mode === MODE_VIDEO;
	saveButton.disabled = mode === MODE_VIDEO;

	let video = document.getElementById('vid');
	let canvasContainer = document.getElementById('canvasContainer');
	// let annotationButtons = document.getElementById('annotationButtons');

	video.style.display = mode === MODE_VIDEO ? 'block' : 'none';
	canvasContainer.style.display = mode === MODE_CANVAS ? 'inline-block' : 'none';
	// annotationButtons.style.display = mode === MODE_CANVAS ? 'inline-block' : 'none';
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
		
		let blob = await new Promise((res, rej)=>{
			let canvas = document.getElementById('thumbnail');
			canvas.toBlob(res, 'image/jpeg');
			// hiddenCanvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
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