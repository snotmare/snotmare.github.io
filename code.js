/**
 * Various links
 * https://stackoverflow.com/questions/46882550/how-to-save-a-jpg-image-video-captured-with-webcam-in-the-local-hard-drive-with
 */

const MODE_VIDEO = 'VIDEO';
const MODE_CANVAS = 'CANVAS';
let mode = MODE_VIDEO;

let hiddenCanvas;

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
			hiddenCanvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
		});

		info('downloading');
		download(blob);
	} catch(error) {
		info(error);
	}
}

async function capture() {
	setMode(MODE_CANVAS);
	let vid = document.querySelector('video');
	
	info('capturing full image');
	hiddenCanvas = document.createElement('canvas'); // create a canvas
	let hiddenContext = hiddenCanvas.getContext('2d'); // get its context
	hiddenCanvas.width = vid.videoWidth; // set its size to the one of the video
	hiddenCanvas.height = vid.videoHeight;
	hiddenContext.drawImage(vid, 0,0); // the video


	info('drawing thumbnail');
	let canvas = document.getElementById('thumbnail');
	let ctx = canvas.getContext('2d'); // get its context
	// canvas.width = vid.videoWidth; // set its size to the one of the video
	// canvas.height = vid.videoHeight;

	// let url = 'https://www.rd.com/wp-content/uploads/2020/01/GettyImages-1131335393-e1580493890249-2048x1367.jpg';
	// let image = new Image();
	// image.src = url;
	// image.onload = () => {
	// 	// ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
	// 	drawImageProp(ctx, image, 0, 0, canvas.width, canvas.height);
	// }

	// drawImageProp(ctx, vid, 0, 0, canvas.width, canvas.height);

	let scale = Math.min(canvas.width / vid.videoWidth, canvas.height / vid.videoHeight);
    let x = (canvas.width / 2) - (vid.videoWidth / 2) * scale;
	let y = (canvas.height / 2) - (vid.videoHeight / 2) * scale;

	let newWidth = vid.videoWidth * scale;
	let newHeight = vid.videoHeight * scale;

    ctx.drawImage(vid, x, y, newWidth, newHeight);

	// ctx.drawImage(vid, 0, 0);

	// info(`video size: ${vid.videoWidth}, ${vid.videoHeight}`);
	// info(`context size: ${ctx.canvas.clientWidth}, ${ctx.canvas.clientHeight}`);
	// info(`canvas size: ${canvas.clientWidth}, ${canvas.clientHeight}`);
}

async function retake() {
	setMode(MODE_VIDEO);

	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
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
	let canvas = document.getElementById('thumbnail');

	video.style.display = mode === MODE_VIDEO ? 'initial' : 'none';
	canvas.style.display = mode === MODE_CANVAS ? 'initial' : 'none';
}

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
	}
}

setTimeout(() => {
	init();
}, 10);