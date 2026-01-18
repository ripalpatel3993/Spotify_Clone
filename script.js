console.log("Hello!");
let currentSong = new Audio();
let songs;
let currFolder;

//fuction is take seconds and give it in time format
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

//cleaning decimal number
function cleanTime(timeStr) {
  let [min, sec] = timeStr.split(":");

  min = parseInt(min, 10);
  sec = Math.floor(parseFloat(sec)); // remove decimal part

  return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

//00:03 / 02:42 anne mare 0%-100% ma convert karvu che ena mate javacript code
function timeToPercent(current, total) {
  const toSeconds = (time) => {
    const [min, sec] = time.split(":").map(Number);
    return min * 60 + sec;
  };

  const currentSec = toSeconds(current);
  const totalSec = toSeconds(total);

  return Math.floor((currentSec / totalSec) * 100);
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  // console.log(response)
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as)
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // songs.push(element.href.split(`/songs/`)[1].replaceAll("-"," ").replace(/\s\d+(?=\.mp3)/, "")) // remove number only
      songs.push(
        element.href.split(`/${currFolder}/`)[1],
        // .replaceAll("-", " ")
        // .replace(/\.mp3/i, "")
        // .replace(/\s*\d+$/, "")
      ); // remove .mp3
    }
  }


  // console.log(songs)
  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songslist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    // songUL.innerHTML = songUL.innerHTML + `<li>${song}</li>`;
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
      <img class="invert" src="svgs/music.svg" alt="">
      <div class="info">
      <div>${song}</div>
      <div>Ripal</div>
      </div>
      <div class="playnow">
      <span>Play Now</span>
      <img class="invert" src="svgs/play2.svg" alt="">
      </div>
      </li>`;
  }

  //Attach an event Listener to each song
  Array.from(
    document.querySelector(".songslist").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", () => {
      // console.log(e.getElementsByTagName("div")[1].innerText);
      playMusic(e.getElementsByTagName("div")[1].innerText);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  //Play the first song
  // var audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play1.src = "svgs/pause.svg";
  }
  // document.querySelector(".songinfo").innerHTML = track; //check
  // document.querySelector(".songinfo").innerHTML = decodeURI(track); //this can be use too! but are best in under code.
  document.querySelector(".songinfo").innerHTML = track
    .replaceAll("-", " ")
    .replace(/%20/g, "")
    .replace(/\.mp3/i, "")
    .replace(/\s*\d+$/, "")
    .replace(/\d+/g, "")
    .replace(/%20/g, "")
    .replace(/\bCopy\b/i, "")
    .replace(/\s+/g, " ")
    .trim();
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  // console.log(response)
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div);
  let anchors = div.getElementsByTagName("a");
  // console.log(anchors);
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes(`/songs/`)) {
      // console.log(e.href.split("/")[4]); // us
      // console.log(e.href.split("/").slice(-1)[0]); // carry
      let folder = e.href.split("/").slice(-1)[0];
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="36"
                  height="36"
                >
                  <!-- Green circle -->
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="#1ed760"
                    stroke="#1ed760"
                    stroke-width="1.5"
                  />

                  <!-- Sharp (nukilo) play triangle -->
                  <path d="M10 8 L10 16 L16 12 Z" fill="black" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpeg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
              <!-- <h2>Ghar Kab Aaoge!</h2>
              <p>Anu Malik,Mithoon,Sonu Nigam,Arijit Singh</p> -->
            </div>`;
    }
  }

  //Load the Playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // console.log(item.currentTarget)
      // console.log(item.currentTarget.getAttribute("data-folder"))
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //Get the list of all the songs
  await getSongs("songs/ncs");
  // console.log(songs);
  playMusic(songs[0], true);

  //Display all the albums on the page
  displayAlbums();

  //Attach an event listerner to play, next and previous
  play1.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play1.src = "svgs/pause.svg";
    } else {
      currentSong.pause();
      play1.src = "svgs/play.svg";
    }
  });

  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(
    //   formatTime(currentSong.currentTime),
    //   formatTime(currentSong.duration)
    // );
    document.querySelector(".songtime").innerHTML =
      cleanTime(formatTime(currentSong.currentTime)) +
      " / " +
      cleanTime(formatTime(currentSong.duration));
    // console.log(
    //   timeToPercent(
    //     cleanTime(formatTime(currentSong.currentTime)),
    //     cleanTime(formatTime(currentSong.duration))
    //   ) + "%"
    // );
    // console.log((currentSong.duration/currentSong.currentTime)*10+ "%")
    document.querySelector(".circle").style.left =
      timeToPercent(
        cleanTime(formatTime(currentSong.currentTime)),
        cleanTime(formatTime(currentSong.duration)),
      ) + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // console.log(e.target.getBoundingClientRect().width);
    // console.log((e.offsetX/e.target.getBoundingClientRect().width)*100 + "%");
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    // console.log( ((currentSong.duration)*percent)/100 + "time")
  });

  // Add an event listerner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  // Add an event listerner for closing hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener for previous click
  previous.addEventListener("click", () => {
    console.log("previous click");
    // console.log(currentSong);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener for next click
  next.addEventListener("click", () => {
    console.log("next click");
    console.log(currentSong.src.split("/").slice(-1)[0]); // carry do
    // console.log(currentSong.src.split("/")[4])  // simple by us
    console.log(songs);
    console.log(songs.indexOf(currentSong.src.split("/").slice(-1)[0]));

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log(e, e.target, e.target.value)
      console.log(`Setting volume to ${e.target.value}/100`);
      // console.log(e.target.value);

      function volumeToRange(value) {
        return Math.min(Math.max(value / 100, 0), 1);
      }

      currentSong.volume = volumeToRange(e.target.value);
      if(currentSong.volume >0){
        document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("svgs/mute.svg","svgs/volume.svg")
      }
    });

  // Add mute event in volume img
  let lastVolume = 1;

  let vol1 = document.querySelector(".volume img");

  vol1.addEventListener("click", (e) => {
    let rangeInput = document.querySelector(".range input");

    if (currentSong.volume > 0) {
      lastVolume = currentSong.volume; // save current volume
      currentSong.volume = 0;
      rangeInput.value = 0;
      e.target.src = "svgs/mute.svg";
    } else {
      currentSong.volume = lastVolume; // restore volume
      rangeInput.value = lastVolume * 100;
      e.target.src = "svgs/volume.svg";
    }
  });
}

main();
