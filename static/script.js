document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("songInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchSong();
        }
    });
});

function searchSong() {
    let query = document.getElementById("songInput").value.trim();
    //  query.value.trim();
    let player = document.getElementById("youtubePlayer");
    let loading = document.getElementById("loading");
    let recommendationsContainer = document.getElementById("recommendations");

    if (query.trim() === "") {
        alert("Please Enter Song Name!");
        return;
    }

    loading.style.display = "block";
    recommendationsContainer.innerHTML = ""; // Clear previous recommendations

    fetch(`/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = "none";

            if (data.error) {
                alert("No results found!");
                return;
            }

            // Display searched song in player
            player.src = `https://www.youtube.com/embed/${data.song.videoId}`;
            player.style.display = "block";

            // Display recommended songs
            if (data.recommendations.length > 0) {
                data.recommendations.forEach(song => {
                    let songElement = document.createElement("div");
                    songElement.classList.add("result-item");

                    document.getElementById("songDetails").innerHTML = `
                        <h3 style="color:rgb(255, 255, 255); font-size: 22px; background-color:rgb(71, 70, 70); margin-top:20px; border-radius: 10px;">🎵${data.song.title}</h3>
                        <p style="font-size: 18px; background-color:rgb(71, 70, 70); margin-top:20px; border-radius: 10px;"><b>Singer:</b> <span style="color:rgb(168, 168, 169);">${data.song.singer || "Unknown"}</span></span>
                        <p style="font-size: 18px; background-color:rgb(71, 70, 70); margin-top:20px; border-radius: 10px;"><b>Release Date:</b> <span style="color: rgb(168, 168, 169);">${data.song.release_date || "N/A"}</span></p>
                        <p style="font-size: 18px; background-color:rgb(71, 70, 70); margin-top:20px; border-radius: 10px;"><b>Views:</b> <span style="color: rgb(168, 168, 169);">${data.song.views || "N/A"}</span></p>
                        <p style="font-size: 18px; background-color:rgb(71, 70, 70); margin-top:20px; border-radius: 10px;"><b>Likes:</b> <span style="color: rgb(168, 168, 169);">${data.song.likes || "N/A"}</span></p>
                    `;

                    songElement.innerHTML = `
                        <img src="${song.thumbnail}" alt="${song.title}">
                        <p>${song.title}</p>
                    `;

                    songElement.onclick = () => {
                        player.src = `https://www.youtube.com/embed/${song.videoId}`;
                        player.style.display = "block";
                        searchSongFromRecommendation(song.title); // Fetch new recommendations for clicked song
                    };

                    recommendationsContainer.appendChild(songElement);
                });
            }
        })
        .catch(error => {
            loading.style.display = "none";
            console.error("Error:", error);
            alert("Something went wrong. Try again later!");
        });
}

function searchSongFromRecommendation(songTitle) {
    let player = document.getElementById("youtubePlayer");
    let recommendationsContainer = document.getElementById("recommendations");
    let loading = document.getElementById("loading");

    loading.style.display = "block";
    recommendationsContainer.innerHTML = ""; // Clear previous recommendations

    fetch(`/search?query=${songTitle}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = "none";

            if (data.error) {
                alert("No results found!");
                return;
            }

            // Update the player with the new song
            player.src = `https://www.youtube.com/embed/${data.song.videoId}`;
            player.style.display = "block";

            // Display new recommendations
            if (data.recommendations.length > 0) {
                data.recommendations.forEach(song => {
                    let songElement = document.createElement("div");
                    songElement.classList.add("result-item");

                    songElement.innerHTML = `
                        <img src="${song.thumbnail}" alt="${song.title}">
                        <p>${song.title}</p>
                    `;

                    songElement.onclick = () => {
                        player.src = `https://www.youtube.com/embed/${song.videoId}`;
                        player.style.display = "block";
                        searchSongFromRecommendation(song.title); // Fetch new recommendations for clicked song
                    };

                    recommendationsContainer.appendChild(songElement);
                });
            }
        })
        .catch(error => {
            loading.style.display = "none";
            console.error("Error:", error);
            alert("Something went wrong. Try again later!");
        });
}

const text = "Music Recommendation System";
const speed = 100;
const heading = document.querySelector(".heading");

let index = 0;

function typeText() {
    if (index <= text.length) {
        heading.textContent = text.substring(0, index);
        index++;
        setTimeout(typeText, speed);
    } else {
        heading.style.borderRight = "none";
        speakText(text);
    }
}

function speakText() {
    let speech = new SpeechSynthesisUtterance("Welcome to the Music Recommendation System");
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

document.addEventListener("DOMContentLoaded", typeText);

function openPopup() {
    document.getElementById("popup").style.display = "flex";
    document.getElementById("popupSound").play();
}

function closePopup() {
    let audio = document.getElementById("popupSound");
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    document.getElementById("popup").style.display = "none";
}

// Automatically show popup after 10 seconds
setTimeout(openPopup, 10000);

function openPopup() {
    document.getElementById("popup").style.display = "flex";
    let audio = document.getElementById("popupSound");

    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Autoplay blocked! Playing on user interaction instead.");
            document.addEventListener("click", () => audio.play(), { once: true });
        });
    }
}

document.getElementById("instagramLink").addEventListener("click", function (event) {
    event.preventDefault();
    let audio = document.getElementById("instagramSound");

    if (audio) {
        audio.play().then(() => {
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, audio.duration * 1000);
        }).catch(error => {
            console.warn("Autoplay blocked! Playing on user interaction instead.");
        });
    }

    window.open(this.href, "_blank");
});

// Hide preloader and show content when page is fully loaded
window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    let content = document.getElementById("content");

    preloader.style.opacity = "0";
    setTimeout(() => {
        preloader.style.display = "none";
        content.style.display = "block";
        document.body.style.overflow = "auto";
    }, 500);
});
