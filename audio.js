// 替换 your-music.mp3 为你的 mp3 文件路径
const playBtn = document.getElementById('playBtn');
const audio = document.getElementById('audioPlayer');
let playing = false;
playBtn.addEventListener('click', () => {
    if (!playing) {
        audio.play();
        playBtn.textContent = '⏸';
    } else {
        audio.pause();
        playBtn.textContent = '▶';
    }
    playing = !playing;
});
audio.addEventListener('ended', () => {
    playBtn.textContent = '▶';
    playing = false;
});