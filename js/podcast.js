const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });
}

const podcastSearch = document.getElementById("podcastSearch");
const podcastList = document.getElementById("podcastList");
const podcastCount = document.getElementById("podcastCount");

const mainVideo = document.getElementById("mainVideo");
const podcastTitle = document.getElementById("podcastTitle");
const podcastDescription = document.getElementById("podcastDescription");
const podcastDate = document.getElementById("podcastDate");

const videoMode = document.getElementById("videoMode");
const audioMode = document.getElementById("audioMode");

const downloadBtn = document.getElementById("downloadBtn");
const downloadModal = document.getElementById("downloadModal");
const closeDownloadModal = document.getElementById("closeDownloadModal");
const downloadVideoLink = document.getElementById("downloadVideoLink");
const downloadAudioLink = document.getElementById("downloadAudioLink");

let podcasts = [];
let filteredPodcasts = [];
let currentPodcast = null;
let currentMode = "video";

async function loadPodcasts() {
  try {
    const res = await fetch("data/podcasts.json");
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid podcast data");
    }

    podcasts = [...data].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );

    filteredPodcasts = [...podcasts];
    renderPodcastList(filteredPodcasts);
    updateCount(filteredPodcasts.length);

    if (filteredPodcasts.length > 0) {
      selectPodcast(filteredPodcasts[0].id);
    } else {
      renderEmptyPlayer();
    }
  } catch (error) {
    console.error(error);
    renderListError();
    renderEmptyPlayer("Подкастуудыг ачаалж чадсангүй.");
  }
}

function renderPodcastList(list) {
  podcastList.innerHTML = "";

  if (list.length === 0) {
    podcastList.innerHTML = `
      <div class="podcast-empty-state">
        <h4>Подкаст олдсонгүй</h4>
        <p>Өөр үгээр хайж үзээрэй.</p>
      </div>
    `;
    return;
  }

  list.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "podcast-card-item";
    button.dataset.id = item.id;

    const cover = item.cover || "assets/covers/default-cover.jpg";

    button.innerHTML = `
      <img src="${cover}" alt="${escapeHtml(item.title || "podcast")}" />
      <div class="podcast-card-body">
        <span>${formatDate(item.date)}</span>
        <h4>${escapeHtml(item.title || "Untitled")}</h4>
        <p>${escapeHtml(truncateText(item.description || "", 90))}</p>
      </div>
    `;

    button.addEventListener("click", () => {
      selectPodcast(item.id);
    });

    podcastList.appendChild(button);
  });

  highlightActive();
}

function selectPodcast(id) {
  const item =
    filteredPodcasts.find((podcast) => podcast.id === id) ||
    podcasts.find((podcast) => podcast.id === id);

  if (!item) return;

  currentPodcast = item;
  currentMode = "video";

  podcastTitle.textContent = item.title || "Untitled";
  podcastDescription.textContent = item.description || "";
  podcastDate.textContent = formatDate(item.date);

  downloadVideoLink.href = item.video || "#";
  downloadAudioLink.href = item.audio || "#";

  downloadVideoLink.setAttribute("download", getFileName(item.video, "video"));
  downloadAudioLink.setAttribute("download", getFileName(item.audio, "audio"));

  renderMainMedia();
  highlightActive();
}

function renderMainMedia() {
  if (!currentPodcast || !mainVideo) return;

  if (currentMode === "audio") {
    mainVideo.innerHTML = `
      <div class="audio-player-wrap">
        <div class="audio-player-inner">
          <p class="audio-label">Audio Mode</p>
          <audio controls style="width:100%;">
            <source src="${currentPodcast.audio || ""}">
          </audio>
        </div>
      </div>
    `;
    return;
  }

  const youtubeId = getYouTubeId(currentPodcast.video);

  if (youtubeId) {
    mainVideo.innerHTML = `
      <div class="youtube-player-wrap">
        <iframe
          src="https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1"
          title="${escapeHtml(currentPodcast.title || "Podcast video")}"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
    return;
  }

  mainVideo.innerHTML = `
    <div class="youtube-player-wrap">
      <video controls playsinline style="width:100%; height:100%; display:block;">
        <source src="${currentPodcast.video || ""}">
      </video>
    </div>
  `;
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function highlightActive() {
  const items = podcastList.querySelectorAll(".podcast-card-item");
  items.forEach((item) => {
    const active = currentPodcast && Number(item.dataset.id) === currentPodcast.id;
    item.classList.toggle("active-podcast-card", active);
  });
}

function renderEmptyPlayer(message = "Одоогоор подкаст алга.") {
  mainVideo.innerHTML = `
    <div class="podcast-empty-state">
      <h4>Подкаст байхгүй</h4>
      <p>${message}</p>
    </div>
  `;
  podcastTitle.textContent = "Подкаст байхгүй";
  podcastDescription.textContent = message;
  podcastDate.textContent = "";
}

function renderListError() {
  podcastList.innerHTML = `
    <div class="podcast-empty-state">
      <h4>Алдаа гарлаа</h4>
      <p>podcasts.json файлаа шалгана уу.</p>
    </div>
  `;
}

function updateCount(count) {
  podcastCount.textContent = `${count} дугаар`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("mn-MN");
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFileName(path, fallback) {
  if (!path) return fallback;
  const parts = path.split("/");
  return parts[parts.length - 1] || fallback;
}

if (podcastSearch) {
  podcastSearch.addEventListener("input", () => {
    const query = podcastSearch.value.trim().toLowerCase();

    filteredPodcasts = podcasts.filter((item) =>
      [item.title || "", item.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

    renderPodcastList(filteredPodcasts);
    updateCount(filteredPodcasts.length);

    if (filteredPodcasts.length > 0) {
      if (!currentPodcast || !filteredPodcasts.some((item) => item.id === currentPodcast.id)) {
        selectPodcast(filteredPodcasts[0].id);
      } else {
        highlightActive();
      }
    } else {
      renderEmptyPlayer("Таны хайсан үгтэй подкаст олдсонгүй.");
    }
  });
}

if (videoMode) {
  videoMode.addEventListener("click", () => {
    if (!currentPodcast) return;
    currentMode = "video";
    renderMainMedia();
  });
}

if (audioMode) {
  audioMode.addEventListener("click", () => {
    if (!currentPodcast) return;
    currentMode = "audio";
    renderMainMedia();
  });
}

function openDownloadModal() {
  downloadModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeDownloadPopup() {
  downloadModal.classList.add("hidden");
  document.body.style.overflow = "";
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    if (!currentPodcast) return;
    openDownloadModal();
  });
}

if (closeDownloadModal) {
  closeDownloadModal.addEventListener("click", closeDownloadPopup);
}

if (downloadModal) {
  downloadModal.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup-backdrop")) {
      closeDownloadPopup();
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && downloadModal && !downloadModal.classList.contains("hidden")) {
    closeDownloadPopup();
  }
});

loadPodcasts();