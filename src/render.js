//Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;


const { desktopCapturer, remote } = require('electron');

// get the available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = remote.Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        }
        ));

    videoOptionsMenu.popup();
    let mediaRecorder; // MediaRecorder instance to capture footage
    let recordedChunks = [];

    async function selectSource(source) {

        videoSelectBtn.innerText = source.name;

        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                }
            }
        };

        // create a stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // preview the source in a video element
        videoElement.srcObject = stream;
        videoElement.play();

        const options = { mimeType: 'video/webm; codecs=vp9' };
        const mediaRecorder = new MediaRecorder(stream, options);

        // register event handlers
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
    }

    function handleDataAvailable(e) {
        console.log('video data available');
        recordedChunks.push(e.data);
    }

    const { writeFile } = require('fs');
    // save the video file on stop
    async function handleStop(e) {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        });

        const buffer = Buffer.from(await blob.arrayBuffer());

        const { filePath } = await dialog.showSaveDialog({
            buttonLabel: 'Save video',
            defaultPath: `vid-${Date.now()}.webm`
        });

        console.log(filePath);

        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }
}
