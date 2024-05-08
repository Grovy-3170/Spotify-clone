let songs = []
let folder = []
let currentFolder;
let playPromise = 0;
let currentsong = new Audio();

async function displayFolders(folder){
    let x = await fetch(folder+"info.json");
    let info = await x.json();
    let div = document.createElement('div');
    div.innerHTML = `
        <div class="picture">
            <div class="play">
                <img  src="images/play2.svg" alt="open">
            </div>
            <img src="${folder}/cover.png" alt="playist">
        </div>
        <div class="text">
            <h3>${info["title"]}</h3>
            <p>${info["description"]}</p>
        </div>
    `
    div.addEventListener('click',async ()=>{
        currentFolder = folder;
        let songlists = await getSongs();
        await play_pause(songlists);
        playsong(songs[0],songlists);
    })
    div.classList.add('card');
    div.classList.add('cursor');
    document.querySelector('.cards').append(div);
}

async function getfolder(){
    let a = await fetch("https://drive.google.com/drive/folders/1efLqjuiwLA2PGmFrdiN1rIBYfY3c9OmP?usp=sharing");
    let response = await a.text();
    console.log(response);
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = Array.from(div.getElementsByTagName('a'));
    as.forEach(e => {
        console.log(e);
        if(e.href.includes("/folders")){
            folder.push(e.href);
        }
    });
    //display folders
    folder.forEach(async e => {
        await displayFolders(e);
    });
}


async function getSongs(){
    songs = [];
    let a = await fetch(currentFolder);
    let response =  await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    for(let i = 0;i < as.length;i++){
        if(as[i].href.endsWith('.mp3')){
            songs.push(as[i].href);
        }
    }
    let songsdiv = document.querySelector('.songs').firstElementChild;
    songsdiv.innerHTML = "";
    songs.forEach(e => {
        const element = e.split('/')[5].replaceAll("%20"," ").replace(".mp3","");
        let sname = element.split('-')[0];
        let aname = element.split('-')[1];
        songsdiv.innerHTML += `
            <li>
                <div class="song-info">
                <img class="invert" src="images/music.svg" alt="music">
                <div class="info">
                    <p class="song-name">${sname}</p>
                    <p class="author-name">By ${aname}</p>
                </div>
                </div>
                <div class="play-song cursor">
                    <p>Play now</p>
                    <img class="invert" src="images/play.svg" alt="play">
                </div>
            </li>
        `
    });
    let songlists = songsdiv.querySelectorAll('.play-song');
    for(let i = 0;i < songlists.length;i++){
        songlists[i].addEventListener('click',async ()=>{
            if(songs[i] == currentsong.src){
                await play_pause(songlists);
            }
            else {
                await playsong(songs[i], songlists)
            };
        })
    }
    document.querySelector('.play-bar>.song-info>p').innerHTML = songs[0].split('/')[5].replaceAll("%20"," ");
    currentsong.src = songs[0];
    return songlists;
}

function formatTime(time) {
    // Convert time to minutes and seconds
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    // Add leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Return formatted time as a string
    return `${formattedMinutes}:${formattedSeconds}`;
}

let playsong = async (song, songlists, fromfolder = false)=>{
    if(!currentsong.paused){
        currentsong.pause();
        play.src = "images/play.svg";
        let index = songs.indexOf(currentsong.src);
        songlists[index].querySelector('img').src = "images/play.svg";
    }
    let index = songs.indexOf(song);
    songlists[index].querySelector('img').src = "images/pause.svg";
    currentsong.src = song;
    play.src = "images/pause.svg";
    document.querySelector('.play-bar>.song-info>p').innerHTML = song.split('/')[5].replaceAll("%20"," ");
    playPromise = currentsong.play();
}

let play_pause = async (songlists)=>{
    let index = songs.indexOf(currentsong.src);
    if(!currentsong.paused){
        play.src = "images/play.svg";
        songlists[index].querySelector('img').src = "images/play.svg";
        currentsong.pause();
    } else{
        play.src = "images/pause.svg";
        songlists[index].querySelector('img').src = "images/pause.svg";
        playPromise = currentsong.play();
    }
}

async function main(){
    await getfolder();
    currentFolder = folder[0];
    await getSongs(folder[0]);
    currentsong.addEventListener('loadedmetadata', function() {
        document.querySelector('.play-bar>.info-box>.time-info').innerHTML = formatTime(currentsong.currentTime) + "/" + formatTime(currentsong.duration);
    });
    play.addEventListener('click',()=>{
        play_pause(document.querySelector('.songs').firstElementChild.querySelectorAll('.play-song'));
    });
    previous.addEventListener('click',()=>{
        let index = songs.indexOf(currentsong.src);
        index--;
        if(index <0){
            index = songs.length - 1;
        }
        playsong(songs[index],document.querySelector('.songs').firstElementChild.querySelectorAll('.play-song'));
    })
    next.addEventListener('click',()=>{
        let index = songs.indexOf(currentsong.src);
        index++;
        if(index >= songs.length){
            index = 0;
        }
        playsong(songs[index],document.querySelector('.songs').firstElementChild.querySelectorAll('.play-song'));
    })
    currentsong.addEventListener('timeupdate',()=>{
        if(currentsong.currentTime === currentsong.duration) {
            play_pause(document.querySelector('.songs').firstElementChild.querySelectorAll('.play-song'));
            next.click()
        };
        document.querySelector('.play-bar>.info-box>.time-info').innerHTML = formatTime(currentsong.currentTime) + "/" + formatTime(currentsong.duration);
        document.querySelector('.seeker>.circle').style.left = (currentsong.currentTime/currentsong.duration)*100 + "%";
    })
    prevList.addEventListener('click',async ()=>{
        let index = folder.indexOf(currentFolder);
        index--;
        if(index < 0) index = folder.length - 1;
        currentFolder = folder[index];
        let songlists = await getSongs();
        await play_pause(songlists);
        playsong(songs[0],songlists);
    })
    nextList.addEventListener('click',async ()=>{
        let index = folder.indexOf(currentFolder);
        index++;
        if(index >= folder.length)index = 0;
        currentFolder = folder[index];
        let songlists = await getSongs();
        await play_pause(songlists);
        playsong(songs[0],songlists);
    })
    document.querySelector('.seeker').addEventListener('click',(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) *100;
        currentsong.currentTime = (currentsong.duration * percent ) /100;
    })
    
    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left = 0;
        document.querySelector('body').classList.add('hidden-overflow');
    })
    document.querySelector('.cross').addEventListener('click',()=>{
        document.querySelector('.left').style.left = "-100vw";
        document.querySelector('body').classList.remove('hidden-overflow');
    })
    volumeRange.addEventListener('input',(e)=>{
        currentsong.volume = e.target.value / 100;
        if(currentsong.volume == 0){
            volumeBtn.src = "images/mute.svg";
        } else {
            volumeBtn.src = "images/volume.svg";
        }
    })
    let prevol = 1;
    volumeBtn.addEventListener('click',()=>{
        if(currentsong.volume == 0){
            currentsong.volume = prevol;
            volumeBtn.src = "images/volume.svg";
            volumeRange.value = 100*prevol;

        } else{
            prevol = currentsong.volume;
            currentsong.volume = 0;
            volumeBtn.src = "images/mute.svg";
            volumeRange.value = 0;
        }
    })
    let pending = Array.from(document.querySelectorAll(".notavailable"));
    pending.forEach(e => {
        e.addEventListener('click',()=>{
            alert("This feature is not yet available");
        })
    });
}


main() 
