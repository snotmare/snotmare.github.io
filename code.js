/**
 * Various links
 * https://stackoverflow.com/questions/46882550/how-to-save-a-jpg-image-video-captured-with-webcam-in-the-local-hard-drive-with
 */

const MODE_VIDEO = 'VIDEO';
const MODE_CANVAS = 'CANVAS';
let mode = MODE_VIDEO;

let options = {
	audio: false,
	video: {
		facingMode: 'environment'
	}
};

async function save(){
	try {
		info('saving');
		// const canvas = document.createElement('canvas'); // create a canvas
		// const ctx = canvas.getContext('2d'); // get its context
		// let vid = document.querySelector('video');
		// canvas.width = vid.videoWidth; // set its size to the one of the video
		// canvas.height = vid.videoHeight;
		// ctx.drawImage(vid, 0,0); // the video

		let canvas = document.getElementById('canvas');
		
		let blob = await new Promise((res, rej)=>{
			canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
		});

		info('downloading');
		download(blob);
	} catch(error) {
		info(error);
	}
}

async function capture() {
	setMode(MODE_CANVAS);

	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d'); // get its context
	let vid = document.querySelector('video');
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

	let ratio = (canvas.height / vid.videoHeight) * vid.videoWidth;
	ctx.drawImage(vid, 0, 0, ratio, canvas.height);
	// ctx.drawImage(vid, 0, 0); // the video
}

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}

async function retake() {
	setMode(MODE_VIDEO);
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
	let canvas = document.getElementById('canvas');

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
		info('getting media');
		let stream = await navigator.mediaDevices.getUserMedia(options); // request cam
		
		info('initing canvas');
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