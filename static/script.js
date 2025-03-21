document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("songInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchSong();
        }
    });
});
function searchSong() {
    let query = document.getElementById("songInput").value;
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
                <span style="font-size: 18px; background-color:rgb(71, 70, 70); margin-top:40px; margain-bottom:40px; margain-right:30px border-radius: 10px;"><b>Singer:</b> <span style="color:rgb(168, 168, 169);">${data.song.singer || "Unknown"}</span></span>
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
        speakText(text); // Speak the text once it's fully written
    }
}

function speakText() {
    let speech = new SpeechSynthesisUtterance("welcome music Recommendation System");
    speech.lang = "en-US"; // Set language to English
    speech.rate = 1; // Normal speaking speed
    speech.pitch = 1; // Normal pitch
    speech.volume = 1; // Full volume
    window.speechSynthesis.speak(speech);
}

document.addEventListener("DOMContentLoaded", typeText);








function openPopup() {
    document.getElementById("popup").style.display = "flex";
    document.getElementById("popupSound").play();  // Play sound when popup appears
}

function closePopup() {
    let audio = document.getElementById("popupSound");
    if (audio) {
        audio.pause();       // Pause the audio
        audio.currentTime = 0; // Reset to the beginning
    }
    document.getElementById("popup").style.display = "none";
}

// Automatically show popup after 10 seconds
setTimeout(openPopup, 10000);


function openPopup() {
    document.getElementById("popup").style.display = "flex";

    let audio = document.getElementById("popupSound");

    // Try playing the sound only if user has interacted (click, keypress, etc.)
    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Autoplay blocked! Playing on user interaction instead.");
            document.addEventListener("click", () => audio.play(), { once: true });

        });
    }
}

document.getElementById("instagramLink").addEventListener("click", function (event) {
    event.preventDefault(); // 
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
        content.style.display = "block"; // Show content after preloader
        document.body.style.overflow = "auto"; // Enable scrolling after load
    }, 500);
});
