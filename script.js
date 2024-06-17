document.getElementById('fileInput').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        const videoPlayer = document.getElementById('videoPlayer');
        const audioPlayer = document.getElementById('audioPlayer');
        const loopCheckbox = document.getElementById('loopCheckbox');

        // Hide both players initially
        videoPlayer.style.display = 'none';
        audioPlayer.style.display = 'none';

        // Check file type and set appropriate player
        if (file.type.startsWith('video/')) {
            videoPlayer.src = fileURL;
            videoPlayer.style.display = 'block';
            videoPlayer.load();
            videoPlayer.play();
            videoPlayer.loop = loopCheckbox.checked;
        } else if (file.type.startsWith('audio/')) {
            audioPlayer.src = fileURL;
            audioPlayer.style.display = 'block';
            audioPlayer.load();
            audioPlayer.play();
            audioPlayer.loop = loopCheckbox.checked;
        } else {
            const convertedFileURL = await convertFile(file);
            if (convertedFileURL) {
                if (file.type.startsWith('video/')) {
                    videoPlayer.src = convertedFileURL;
                    videoPlayer.style.display = 'block';
                    videoPlayer.load();
                    videoPlayer.play();
                    videoPlayer.loop = loopCheckbox.checked;
                } else if (file.type.startsWith('audio/')) {
                    audioPlayer.src = convertedFileURL;
                    audioPlayer.style.display = 'block';
                    audioPlayer.load();
                    audioPlayer.play();
                    audioPlayer.loop = loopCheckbox.checked;
                }
            }
        }

        // Listen for changes to the loop checkbox
        loopCheckbox.addEventListener('change', function() {
            videoPlayer.loop = loopCheckbox.checked;
            audioPlayer.loop = loopCheckbox.checked;
        });
    }
});

async function convertFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function() {
            const ffmpeg = await createFFmpeg({ log: true });
            await ffmpeg.load();
            ffmpeg.FS('writeFile', 'input', new Uint8Array(reader.result));

            const outputFormat = file.type.startsWith('video/') ? 'mp4' : 'mp3';
            const outputFileName = `output.${outputFormat}`;

            await ffmpeg.run('-i', 'input', outputFileName);

            const data = ffmpeg.FS('readFile', outputFileName);
            const convertedBlob = new Blob([data.buffer], { type: file.type.startsWith('video/') ? 'video/mp4' : 'audio/mp3' });
            const convertedFileURL = URL.createObjectURL(convertedBlob);

            resolve(convertedFileURL);
        };

        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };

        reader.readAsArrayBuffer(file);
    });
}
