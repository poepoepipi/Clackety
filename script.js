// word list
const WORDS = [
  "the","of","and","a","to","in","is","you","that","it","he","was","for","on","are",
  "as","with","his","they","I","at","be","this","have","from","or","one","had","by",
  "word","but","not","what","all","were","we","when","your","can","said","there","use",
  "an","each","which","she","do","how","their","if","will","up","other","about","out",
  "many","then","them","these","so","some","her","would","make","like","him","into",
  "time","has","look","two","more","write","go","see","number","no","way","could",
  "people","my","than","first","water","been","call","who","oil","its","now","find",
  "long","down","day","did","get","come","made","may","part","over","new","sound",
  "take","only","little","work","know","place","year","live","me","back","give",
  "most","very","after","thing","our","just","name","good","sentence","man","think",
  "say","great","where","help","through","much","before","line","right","too","mean",
  "old","any","same","tell","boy","follow","came","want","show","also","around",
  "form","three","small","set","put","end","does","another","well","large","must",
  "big","even","such","because","turn","here","why","ask","went","men","read","need",
  "land","different","home","us","move","try","kind","hand","picture","again","change",
  "off","play","spell","air","away","animal","house","point","page","letter","mother",
  "answer","found","study","still","learn","should","world","idiot","Hackclub","minutes",
  "school","father","family","food","city","country","friend","children","life","under",
  "story","group","start","keep","last","might","while","never","thought","left",
  "begin","sometimes","next","high","every","near","important","few","those","both",
  "once","always","often","something","really","together","own","found","between","another",
  "three","different","house","world","small","large","young","old","early","late",
  "night","morning","today","tomorrow","yesterday","week","month","year","hour","minute",
  "second","water","fire","earth","light","dark","place","room","door","window",
  "car","road","street","tree","walk","run","move","stop","open","close",
  "start","end","begin","help","keep","bring","leave","put","take","give",
  "find","look","watch","hear","listen","talk","speak","read","write","learn",
  "remember","understand","remember","think","know","believe","feel","want","need","like",
  "love","hate","play","live","happen","become","seem","leave","call","show",
  "world","school","company","problem","question","answer","idea","example","fact","number",
  "money","power","part","side","head","face","body","eye","hand","foot",
  "family","father","mother","brother","sister","child","friend","person","people","man",
  "woman","boy","girl","name","word","book","paper","page","line","letter",
  "computer","phone","internet","website","program","code","game","screen","keyboard","mouse",
  "music","movie","picture","video","sound","color","black","white","red","blue",
  "green","happy","easy","hard","fast","slow","strong","different","possible","better",
  "best","important","real","right","wrong","sure","enough","almost","already","together"
];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateWords(count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(randomWord());
  return arr;
}

const state = {
  duration: 30,
  timeLeft: 30,
  words: [],
  text: "",
  typed: "",
  charStates: [],
  started: false,
  finished: false,
  timerId: null,
  correctChars: 0,
  incorrectChars: 0,
  totalKeystrokes: 0,
};

const textDisplay = document.getElementById("text-display");
const hiddenInput = document.getElementById("hidden-input");
const typeArea = document.getElementById("type-area");
const clickHint = document.getElementById("click-hint");
const timerValue = document.getElementById("timer-value");
const wpmValue = document.getElementById("wpm-value");
const accValue = document.getElementById("acc-value");
const restartBtn = document.getElementById("restart-btn");
const tryAgainBtn = document.getElementById("try-again-btn");
const resultsSection = document.getElementById("results");
const liveStats = document.getElementById("live-stats");
const bestGrid = document.getElementById("best-grid");
const timeOptions = document.querySelectorAll("#time-group .option");


function initTest() {
  clearInterval(state.timerId);
  state.timeLeft = state.duration;
  state.words = generateWords(60);
  state.text = state.words.join(" ");
  state.typed = "";
  state.charStates = new Array(state.text.length).fill("pending");
  state.started = false;
  state.finished = false;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.totalKeystrokes = 0;

  hiddenInput.value = "";
  timerValue.textContent = state.timeLeft;
  wpmValue.textContent = "0";
  accValue.textContent = "100%";

  resultsSection.hidden = true;
  liveStats.style.display = "flex";

  renderText();
}

function renderText() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < state.text.length; i++) {
    const span = document.createElement("span");
    span.className = "char " + state.charStates[i];
    if (i === state.typed.length) span.classList.add("current");
    span.textContent = state.text[i];
    frag.appendChild(span);
  }
  textDisplay.innerHTML = "";
  textDisplay.appendChild(frag);

  const currentEl = textDisplay.children[state.typed.length];
  if (currentEl) {
    currentEl.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

function extendWordsIfNeeded() {
  if (state.text.length - state.typed.length < 100) {
    const more = generateWords(30);
    state.text += " " + more.join(" ");
    state.charStates = state.charStates.concat(new Array(more.join(" ").length + 1).fill("pending"));
  }
}


function startTimer() {
  state.started = true;
  state.timerId = setInterval(() => {
    state.timeLeft--;
    timerValue.textContent = state.timeLeft;
    updateLiveWpm();
    if (state.timeLeft <= 0) {
      finishTest();
    }
  }, 1000);
}

function updateLiveWpm() {
  const elapsedMinutes = (state.duration - state.timeLeft) / 60;
  if (elapsedMinutes <= 0) return;
  const wpm = Math.round((state.correctChars / 5) / elapsedMinutes);
  wpmValue.textContent = Math.max(0, wpm);

  const totalTyped = state.correctChars + state.incorrectChars;
  const acc = totalTyped > 0 ? Math.round((state.correctChars / totalTyped) * 100) : 100;
  accValue.textContent = acc + "%";
}

function handleInput(e) {
  if (state.finished) return;

  const value = hiddenInput.value;

  if (!state.started && value.length > 0) {
    startTimer();
  }

  if (value.length > state.typed.length) {
    const idx = state.typed.length;
    const expected = state.text[idx];
    const typedChar = value[idx];
    if (typedChar === expected) {
      state.charStates[idx] = "correct";
      state.correctChars++;
    } else {
      state.charStates[idx] = "incorrect";
      state.incorrectChars++;
    }
    state.totalKeystrokes++;
  } else if (value.length < state.typed.length) {
    for (let i = value.length; i < state.typed.length; i++) {
      if (state.charStates[i] === "correct") state.correctChars--;
      if (state.charStates[i] === "incorrect") state.incorrectChars--;
      state.charStates[i] = "pending";
    }
  }

  state.typed = value;
  extendWordsIfNeeded();
  renderText();
  updateLiveWpm();
}

function finishTest() {
  state.finished = true;
  clearInterval(state.timerId);
  hiddenInput.blur();

  const elapsedMinutes = state.duration / 60;
  const correctWpm = Math.round((state.correctChars / 5) / elapsedMinutes);
  const totalTyped = state.correctChars + state.incorrectChars;
  const rawWpm = Math.round((totalTyped / 5) / elapsedMinutes);
  const acc = totalTyped > 0 ? Math.round((state.correctChars / totalTyped) * 100) : 100;

  document.getElementById("result-wpm").textContent = correctWpm;
  document.getElementById("result-acc").textContent = acc + "%";
  document.getElementById("result-raw").textContent = rawWpm;
  document.getElementById("result-chars").textContent = totalTyped;

  liveStats.style.display = "none";
  resultsSection.hidden = false;

  saveBestScore(state.duration, correctWpm);
  renderBestScores();
}

const STORAGE_KEY = "keystroke-best-scores";

function loadBestScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveBestScore(duration, wpm) {
  const scores = loadBestScores();
  if (!scores[duration] || wpm > scores[duration]) {
    scores[duration] = wpm;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }
}

function renderBestScores() {
  const scores = loadBestScores();
  const durations = [15, 30, 60, 120];
  bestGrid.innerHTML = "";
  durations.forEach((d) => {
    const card = document.createElement("div");
    card.className = "best-card";
    const best = scores[d] || 0;
    card.innerHTML = `<span class="best-time">${d}s</span><span class="best-wpm">${best}</span>`;
    bestGrid.appendChild(card);
  });
}

typeArea.addEventListener("click", () => hiddenInput.focus());
hiddenInput.addEventListener("input", handleInput);

restartBtn.addEventListener("click", initTest);
tryAgainBtn.addEventListener("click", initTest);

document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    initTest();
    hiddenInput.focus();
  }
});

timeOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    timeOptions.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.duration = parseInt(btn.dataset.time, 10);
    initTest();
  });
});

window.addEventListener("keydown", (e) => {
  if (document.activeElement !== hiddenInput && e.key.length === 1) {
    hiddenInput.focus();
  }
});

initTest();
renderBestScores();