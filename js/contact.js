const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });
}

const contactForm = document.getElementById("contactForm");
const contactCategory = document.getElementById("contactCategory");
const contactMessage = document.getElementById("contactMessage");
const formStatus = document.getElementById("formStatus");

const micBtn = document.getElementById("micBtn");
const stopMicBtn = document.getElementById("stopMicBtn");
const micStatus = document.getElementById("micStatus");

let recognition = null;
let isListening = false;
let finalTranscriptBuffer = "";

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micStatus.textContent = "Энэ browser дээр voice input ажиллахгүй байна.";
    micBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "mn-MN";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    isListening = true;
    micStatus.textContent = "Сонсож байна...";
    micBtn.classList.add("hidden");
    stopMicBtn.classList.remove("hidden");
    finalTranscriptBuffer = contactMessage.value.trim();
  };

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += text + " ";
      } else {
        interimText += text;
      }
    }

    const merged = [finalTranscriptBuffer, finalText.trim(), interimText.trim()]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    contactMessage.value = merged;
  };

  recognition.onerror = (event) => {
    micStatus.textContent = `Voice input алдаа: ${event.error}`;
    isListening = false;
    micBtn.classList.remove("hidden");
    stopMicBtn.classList.add("hidden");
  };

  recognition.onend = () => {
    isListening = false;
    micStatus.textContent = "Microphone зогслоо";
    micBtn.classList.remove("hidden");
    stopMicBtn.classList.add("hidden");
    finalTranscriptBuffer = contactMessage.value.trim();
  };
}

if (micBtn) {
  micBtn.addEventListener("click", () => {
    if (!recognition || isListening) return;
    recognition.start();
  });
}

if (stopMicBtn) {
  stopMicBtn.addEventListener("click", () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = contactCategory.value.trim();
    const message = contactMessage.value.trim();

    if (!category) {
      formStatus.textContent = "Ангиллаа сонгоно уу.";
      return;
    }

    if (!message) {
      formStatus.textContent = "Зурвасаа бичнэ үү.";
      return;
    }

    formStatus.textContent = "Илгээж байна...";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          message,
          transcript: ""
        })
      });

      const data = await res.json();

      if (!res.ok) {
        formStatus.textContent = data.message || "Илгээхэд алдаа гарлаа.";
        return;
      }

      formStatus.textContent = data.message || "Амжилттай илгээгдлээ.";
      contactForm.reset();
      micStatus.textContent = "Microphone idle";
      finalTranscriptBuffer = "";
    } catch (error) {
      formStatus.textContent = "Server-тэй холбогдоход алдаа гарлаа.";
      console.error(error);
    }
  });
}

setupSpeechRecognition();