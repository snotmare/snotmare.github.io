// https://stackoverflow.com/questions/46882550/how-to-save-a-jpg-image-video-captured-with-webcam-in-the-local-hard-drive-with
let options = {
	audio: false,
	video: {
		facingMode: 'environment'
	}
};

async function initMedia() {
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

async function save(){
	try {
		info('saving');
		const canvas = document.createElement('canvas'); // create a canvas
		const ctx = canvas.getContext('2d'); // get its context
		let vid = document.querySelector('video');
		canvas.width = vid.videoWidth; // set its size to the one of the video
		canvas.height = vid.videoHeight;
		ctx.drawImage(vid, 0,0); // the video
		
		let blob = await new Promise((res, rej)=>{
			canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
		});

		info('downloading');
		download(blob);
	} catch(error) {
		info(error);
	}
}

function download(blob){
	// uses the <a download> to download a Blob
	let a = document.createElement('a'); 
	a.href = URL.createObjectURL(blob);
	a.download = 'test.jpg';
	document.body.appendChild(a);
	a.click();
}

function info(value) {
	document.getElementById('output').innerHTML += `${value}<br/>`;
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

//not allowed error request is not allowed by the user agent or the platform of the current context, possibly because the user denied permission
setTimeout(() => {
	initMedia();
}, 10);