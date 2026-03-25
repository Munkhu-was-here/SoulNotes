const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });
}

const videoEl = document.getElementById("highlightVideo");

if (videoEl) {
  videoEl.src = "assets/Highlight1.mp4";
  videoEl.muted = true;
  videoEl.loop = true;  
  videoEl.autoplay = true;
  videoEl.playsInline = true;

  const playPromise = videoEl.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
}

loadHighlight();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker registered"));
}