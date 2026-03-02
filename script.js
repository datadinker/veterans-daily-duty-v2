(() => {
  "use strict";

  // ===== CONFIG =====
  const EPOCH_DATE_ISO = "2026-01-01";
  const ROWS = 6;
  const COLS = 5;

  const STORAGE_KEY_STATS = "dailyDutyStats_v2";
  const STORAGE_KEY_LAST_PLAYED = "dailyDutyLastPlayedDate_v2";
  const STORAGE_KEY_COMPLETED_TODAY = "dailyDutyCompletedToday_v2";
  const STORAGE_KEY_MODE = "dailyDutyMode_v2";
  const STORAGE_KEY_DIFFICULTY = "dailyDutyDifficulty_v2"; // "beginner"|"player"

  const Mode = Object.freeze({ DAILY: "daily", PRACTICE: "practice" });
  const Difficulty = Object.freeze({ BEGINNER: "beginner", PLAYER: "player" });

  // ===== DAILY MESSAGES (LOCKED LIST: 100) =====
  // NOTE: 2–3 words max, neutral, cross-service; rotates daily; repeats after 100 days.
  const DAILY_MESSAGES = [
    "Semper Fi",
    "This We’ll Defend",
    "Semper Fortis",
    "Aim High",
    "Semper Supra",
    "Semper Paratus",
    "Honor Always",
    "Stand Ready",
    "Mission First",
    "Stay Sharp",

    "Serve Proudly",
    "Duty Calls",
    "Strength Endures",
    "Earn Respect",
    "Stay Steady",
    "United Service",
    "Brave Hearts",
    "Hold Fast",
    "Faithful Service",
    "Quiet Professionals",

    "Watchful Eyes",
    "Strong Together",
    "Ready Today",
    "Keep Moving",
    "Forward Always",
    "Courage Daily",
    "True Grit",
    "Firm Resolve",
    "Steel Nerves",
    "Calm Strength",

    "Lead Well",
    "Follow Through",
    "Clear Purpose",
    "Solid Ground",
    "Stay Focused",
    "Answer Ready",
    "Serve Honorably",
    "Steady Hands",
    "Earned Trust",
    "Stay Alert",

    "Silent Strength",
    "Resolve Strong",
    "Lead Forward",
    "Stand Firm",
    "Press On",
    "United Front",
    "Service First",
    "Quiet Resolve",
    "Proud Service",
    "Faithful Always",

    "Strong Spirit",
    "Keep Faith",
    "Move Forward",
    "Hold Ground",
    "True North",
    "Serve Well",
    "Guard Honor",
    "Stay Humble",
    "Earn It",
    "Be Ready",

    "Clear Mind",
    "Strong Mind",
    "Steady Course",
    "Firm Ground",
    "Calm Resolve",
    "Stay True",
    "Always Forward",
    "Courage Within",
    "Faithful Duty",
    "Honor Bound",

    "Service Endures",
    "Stand Tall",
    "Ready Always",
    "Courage Counts",
    "Keep Watch",
    "Earn Honor",
    "Stay Committed",
    "Steady Resolve",
    "Stand United",
    "Quiet Courage",

    "Strength Within",
    "Duty Endures",
    "Forward Together",
    "Brave Service",
    "Stay The Course",
    "Mission Ready",
    "Hold The Line",
    "Courage Always",
    "Serve Together",
    "Stay Vigilant",

    "Honor The Call",
    "Veteran Strong",
    "Thank You Veterans",
    "Proud Veteran",
    "Veteran Proud",
    "Veterans United",
    "Veteran Spirit",
    "Veteran Resolve",
    "Welcome Home",
    "Always Remember",

  "SEMPER FI",
  "THIS WE'LL DEFEND",
  "SEMPER FORTIS",
  "AIM HIGH",
  "SEMPER SUPRA",
  "SEMPER PARATUS",
  "THANK YOU VETERANS",
  "VETERAN STRONG",
  "THANK YOU VA",
  "THANK YOU USO",

  // --- Tactical / Training ---
  "FAST IS SLOW",
  "SLOW IS SMOOTH",
  "SMOOTH IS FAST",
  "OPSEC AWARENESS",
  "READINESS ALWAYS",
  "READINESS IS 24 HOURS",
  "MISSION AWARENESS",
  "MISSION CREEP",
  "HOPE IS NOT A PLAN",
  "GEAR COMES FIRST",
  "WATCH YOUR SIX",
  "CHECK YOUR BUDDY",
  "CALL YOUR BUDDIES",
  "CHECK ON EACH OTHER",
  "SHOOT MOVE COMMUNICATE",
  "BACK AZIMUTH",
  "WINDAGE ELEVATION",

  // --- Culture / Humor ---
  "FIELD DAY",
  "JUNK ON THE BUNK",
  "PAYDAY JOY",
  "PAYDAY BLUES",
  "POGIE BAIT PX",
  "SICKBAY COMMANDO",
  "LIBERTY HOUND",
  "CATTLE CAR",
  "HANGOVERS HURT",
  "BEEN THERE DONE THAT",

  // --- Fitness / Discipline ---
  "FITNESS FIRST",
  "RESPECT YOUR FEET",
  "NO PAIN NO GAIN",
  "FOCUS ON MISSION",
  "EASY WAY IS MINED",

  // --- Power & Capability ---
  "AIR POWER",
  "SEA POWER",
  "LAND SEA AIR",
  "RIFLE RANGE",
  "NIGHT VISION",

  // --- Ceremony / Heritage ---
  "EVENING PARADE",
  "SUNSET PARADE",
  "OLD GUARD",
  "THUNDERBIRDS",
  "BLUE ANGELS",
  "TUN TAVERN",

  // --- Spirit / Identity ---
  "GUARDIAN SPIRIT",
  "FREEDOM AINT FREE",
  "TEAMMATES",
  "SADDLE UP",
  "HOOAH",
  "OORAH",
  "HOOYAH"

  ];

  // ===== DOM =====
  const boardEl = document.getElementById("board");
  const keyboardEl = document.getElementById("keyboard");
  const dailyMessageEl = document.getElementById("dailyMessage");

  const statusLineEl = document.getElementById("statusLine");
  const subStatusLineEl = document.getElementById("subStatusLine");

  const guessInputEl = document.getElementById("guessInput"); // keeps focus/accessibility
  const btnEnterEl = document.getElementById("btnEnter");

  const modeDailyEl = document.getElementById("modeDaily");
  const modePracticeEl = document.getElementById("modePractice");

  const diffBeginnerEl = document.getElementById("difficultyBeginner");
  const diffPlayerEl = document.getElementById("difficultyPlayer");

  const btnStatsEl = document.getElementById("btnStats");
  const btnResetStatsEl = document.getElementById("btnResetStats");

  const statsModalEl = document.getElementById("statsModal");
  const statsBodyEl = document.getElementById("statsBody");
  const btnCloseStatsEl = document.getElementById("btnCloseStats");

  // ===== WORD LISTS =====
  if (!Array.isArray(window.ANSWERS)) {
    throw new Error("ANSWERS not found. wordlist.js must define window.ANSWERS = [...]");
  }
  if (!Array.isArray(window.VALID_WORDS)) {
    throw new Error("VALID_WORDS not found. wordlist.js / valid_words_2000.js must define window.VALID_WORDS = [...]");
  }

  const ANSWERS = window.ANSWERS
    .map(w => String(w).toUpperCase())
    .filter(w => /^[A-Z]{5}$/.test(w));

  const VALID_SET = new Set(
    window.VALID_WORDS
      .map(w => String(w).toUpperCase())
      .filter(w => /^[A-Z]{5}$/.test(w))
  );
 // Ensure all answers are always valid guesses (even if missing from dictionary)
for (const a of ANSWERS) VALID_SET.add(a); 

  if (ANSWERS.length === 0) throw new Error("ANSWERS is empty/invalid.");

  // ===== GAME STATE =====
  const state = {
    mode: Mode.DAILY,
    difficulty: Difficulty.BEGINNER,
    targetWord: "",
    guesses: Array(ROWS).fill(""),
    results: Array.from({ length: ROWS }, () => Array(COLS).fill("")),
    draft: "",
    currentRow: 0,
    status: "idle", // "idle"|"active"|"won"|"lost"|"blocked"
    keyColors: new Map(), // letter -> "gray"|"yellow"|"green"
  };

  // ===== STATS =====
  function defaultStats() {
    return {
      totalPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0],
      lastWinDate: null, // YYYY-MM-DD
    };
  }

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (!raw) return defaultStats();
      const parsed = JSON.parse(raw);
      const s = { ...defaultStats(), ...parsed };
      if (!Array.isArray(s.guessDistribution) || s.guessDistribution.length !== 6) {
        s.guessDistribution = [0, 0, 0, 0, 0, 0];
      }
      return s;
    } catch {
      return defaultStats();
    }
  }

  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }

  // ===== DATE / DAILY INDEX =====
  function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function daysBetweenLocalDates(epochISO, todayKey) {
    const [ey, em, ed] = epochISO.split("-").map(Number);
    const [ty, tm, td] = todayKey.split("-").map(Number);
    const epoch = new Date(ey, em - 1, ed, 0, 0, 0, 0);
    const today = new Date(ty, tm - 1, td, 0, 0, 0, 0);
    return Math.floor((today - epoch) / (1000 * 60 * 60 * 24));
  }

  function getDayIndex() {
    const todayKey = getLocalDateKey();
    return daysBetweenLocalDates(EPOCH_DATE_ISO, todayKey);
  }

  function selectDailyWord() {
    const dayIndex = getDayIndex();
    const idx = ((dayIndex % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
    return ANSWERS[idx];
  }

  function selectDailyMessage() {
    const dayIndex = getDayIndex();
    const idx = ((dayIndex % DAILY_MESSAGES.length) + DAILY_MESSAGES.length) % DAILY_MESSAGES.length;
    return DAILY_MESSAGES[idx];
  }

  function selectPracticeWord(excludeWord = "") {
    let candidate = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    for (let i = 0; i < 30 && candidate === excludeWord; i++) {
      candidate = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    }
    return candidate;
  }

  function isBlockedToday() {
    const todayKey = getLocalDateKey();
    const lastPlayed = localStorage.getItem(STORAGE_KEY_LAST_PLAYED);
    const completed = localStorage.getItem(STORAGE_KEY_COMPLETED_TODAY) === "1";
    return lastPlayed === todayKey && completed;
  }

  function markCompletedToday() {
    const todayKey = getLocalDateKey();
    localStorage.setItem(STORAGE_KEY_LAST_PLAYED, todayKey);
    localStorage.setItem(STORAGE_KEY_COMPLETED_TODAY, "1");
  }

  function clearCompletedFlag() {
    localStorage.removeItem(STORAGE_KEY_COMPLETED_TODAY);
  }

  // ===== EVALUATION =====
  function evaluateGuess(guess, target) {
    const res = Array(COLS).fill("gray");
    const targetArr = target.split("");
    const guessArr = guess.split("");
    const used = Array(COLS).fill(false);

    // greens
    for (let i = 0; i < COLS; i++) {
      if (guessArr[i] === targetArr[i]) {
        res[i] = "green";
        used[i] = true;
        guessArr[i] = null;
      }
    }

    // yellows
    for (let i = 0; i < COLS; i++) {
      if (guessArr[i] == null) continue;
      const ch = guessArr[i];
      let found = -1;
      for (let j = 0; j < COLS; j++) {
        if (!used[j] && targetArr[j] === ch) {
          found = j;
          break;
        }
      }
      if (found >= 0) {
        res[i] = "yellow";
        used[found] = true;
      }
    }
    return res;
  }

  // ===== VALIDATION =====
  function isValidGuess(word) {
    if (state.difficulty === Difficulty.BEGINNER) return true;
    return VALID_SET.has(word);
  }

  // ===== UI HELPERS =====
  function setStatus(main, sub = "") {
    statusLineEl.textContent = main;
    subStatusLineEl.textContent = sub;
  }

  function setModeButtons() {
    modeDailyEl.classList.toggle("primary", state.mode === Mode.DAILY);
    modePracticeEl.classList.toggle("primary", state.mode === Mode.PRACTICE);
  }

  function setDifficultyButtons() {
    diffBeginnerEl?.classList.toggle("primary", state.difficulty === Difficulty.BEGINNER);
    diffPlayerEl?.classList.toggle("primary", state.difficulty === Difficulty.PLAYER);
  }

  function resetSession() {
    state.guesses = Array(ROWS).fill("");
    state.results = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    state.draft = "";
    state.currentRow = 0;
    state.keyColors = new Map();
  }

  function normalizeGuess(raw) {
    return String(raw || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, COLS);
  }

  // ===== BOARD RENDER =====
  function renderBoard() {
    boardEl.innerHTML = "";

    for (let r = 0; r < ROWS; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "row";
      rowEl.dataset.row = String(r);

      const base = state.guesses[r] || "";
      const letters =
        (r === state.currentRow && state.status === "active")
          ? (state.draft || base)
          : base;

      const display = letters.padEnd(COLS).slice(0, COLS).split("");

      for (let c = 0; c < COLS; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";

        const cls = state.results[r][c];
        if (cls) tile.classList.add(cls);

        tile.textContent = display[c] ? display[c] : "";
        rowEl.appendChild(tile);
      }

      boardEl.appendChild(rowEl);
    }

    // Bright-blue highlight around correct row (color-blind friendly)
    // If your CSS already supports this, this simply toggles the class.
    const allRows = boardEl.querySelectorAll(".row");
    allRows.forEach(el => el.classList.remove("winRow"));
    if (state.status === "won") {
      const winRow = boardEl.querySelector(`.row[data-row="${state.currentRow - 1}"]`);
      if (winRow) winRow.classList.add("winRow");
    }
  }

  // ===== KEYBOARD =====
  const KEY_ROWS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["ENTER","Z","X","C","V","B","N","M","DEL"],
  ];

  function colorPriority(existing, incoming) {
    // green > yellow > gray
    const rank = (c) => (c === "green" ? 3 : c === "yellow" ? 2 : c === "gray" ? 1 : 0);
    return rank(incoming) > rank(existing) ? incoming : existing;
  }

  function updateKeyboardColorsFromRow(guess, res) {
    for (let i = 0; i < COLS; i++) {
      const ch = guess[i];
      const color = res[i]; // "green"|"yellow"|"gray"
      const prev = state.keyColors.get(ch) || "";
      state.keyColors.set(ch, colorPriority(prev, color));
    }
  }

  function renderKeyboard() {
    if (!keyboardEl) return;

    keyboardEl.innerHTML = "";
    keyboardEl.classList.add("kbd");

    for (const row of KEY_ROWS) {
      const rowEl = document.createElement("div");
      rowEl.className = "kbdRow";

      for (const key of row) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "key";

        if (key === "ENTER" || key === "DEL") btn.classList.add("wide");

        btn.textContent = (key === "DEL") ? "⌫" : (key === "ENTER" ? "Enter" : key);

        if (/^[A-Z]$/.test(key)) {
          const color = state.keyColors.get(key);
          if (color) btn.classList.add(color);
        }

        btn.addEventListener("click", () => onVirtualKey(key));
        rowEl.appendChild(btn);
      }

      keyboardEl.appendChild(rowEl);
    }
  }

  function onVirtualKey(key) {
    if (state.status !== "active") return;

    if (key === "ENTER") {
      submitDraft();
      return;
    }
    if (key === "DEL") {
      state.draft = state.draft.slice(0, -1);
      renderBoard();
      return;
    }
    if (/^[A-Z]$/.test(key)) {
      if (state.draft.length < COLS) {
        state.draft += key;
        renderBoard();
      }
    }
    guessInputEl.focus();
  }

  // ===== DAILY MESSAGE RENDER =====
  function renderDailyMessage() {
    if (!dailyMessageEl) return;
    dailyMessageEl.textContent = selectDailyMessage();
  }

  // ===== GAME FLOW =====
  function startMode(mode) {
    state.mode = mode;
    localStorage.setItem(STORAGE_KEY_MODE, mode);

    setModeButtons();
    resetSession();
    renderDailyMessage();

    // Keep input focus available
    if (guessInputEl) {
      guessInputEl.value = "";
      guessInputEl.disabled = false;
      guessInputEl.focus();
    }
    if (btnEnterEl) btnEnterEl.disabled = false;

    if (mode === Mode.DAILY) {
      if (isBlockedToday()) {
        state.status = "blocked";
        state.targetWord = selectDailyWord();
        setStatus("Today’s Duty already completed.", "Come back tomorrow for a new word.");
        if (guessInputEl) guessInputEl.disabled = true;
        if (btnEnterEl) btnEnterEl.disabled = true;
      } else {
        state.status = "active";
        state.targetWord = selectDailyWord();
        clearCompletedFlag();
        setStatus(
          "Official Daily active.",
          `Difficulty: ${state.difficulty === Difficulty.BEGINNER ? "Beginner" : "Player"}`
        );
      }
    } else {
      state.status = "active";
      const daily = selectDailyWord();
      state.targetWord = selectPracticeWord(daily);
      setStatus(
        "Practice active.",
        `Difficulty: ${state.difficulty === Difficulty.BEGINNER ? "Beginner" : "Player"}`
      );
    }

    renderBoard();
    renderKeyboard();
  }

  function setDifficulty(diff) {
    state.difficulty = diff;
    localStorage.setItem(STORAGE_KEY_DIFFICULTY, diff);
    setDifficultyButtons();

    if (state.status === "active") {
      setStatus(
        state.mode === Mode.DAILY ? "Official Daily active." : "Practice active.",
        `Difficulty: ${diff === Difficulty.BEGINNER ? "Beginner" : "Player"}`
      );
    }
    guessInputEl.focus();
  }

  function finalizeWin(guessCount) {
    state.status = "won";
    setStatus("Correct. Duty completed.", "");
    if (guessInputEl) guessInputEl.disabled = true;
    if (btnEnterEl) btnEnterEl.disabled = true;

    if (state.mode === Mode.DAILY) {
      const todayKey = getLocalDateKey();
      const yesterdayKey = getLocalDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

      const stats = loadStats();
      stats.totalPlayed += 1;
      stats.totalWins += 1;
      stats.guessDistribution[Math.max(1, Math.min(6, guessCount)) - 1] += 1;

      stats.currentStreak = (stats.lastWinDate === yesterdayKey) ? (stats.currentStreak + 1) : 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.lastWinDate = todayKey;

      saveStats(stats);
      markCompletedToday();
    }
  }

  function finalizeLoss() {
    state.status = "lost";
    setStatus(`Duty failed. Word was ${state.targetWord}.`, "");
    if (guessInputEl) guessInputEl.disabled = true;
    if (btnEnterEl) btnEnterEl.disabled = true;

    if (state.mode === Mode.DAILY) {
      const stats = loadStats();
      stats.totalPlayed += 1;
      stats.totalLosses += 1;
      stats.currentStreak = 0;
      saveStats(stats);
      markCompletedToday();
    }
  }

  function submitDraft() {
    if (state.status !== "active") return;

    const guess = normalizeGuess(state.draft);
    if (guess.length !== COLS) {
      setStatus("Enter exactly 5 letters.", "");
      return;
    }
    if (!isValidGuess(guess)) {
      setStatus("Not in word list.", "Player difficulty requires real words.");
      return;
    }

    const row = state.currentRow;
    state.guesses[row] = guess;

    const res = evaluateGuess(guess, state.targetWord);
    state.results[row] = res;

    updateKeyboardColorsFromRow(guess, res);

    state.currentRow += 1;
    state.draft = "";

    renderBoard();
    renderKeyboard();

    if (guess === state.targetWord) {
      finalizeWin(row + 1);
      // after win, currentRow already advanced, so highlight uses currentRow-1
      renderBoard();
      return;
    }

    if (state.currentRow >= ROWS) {
      finalizeLoss();
      return;
    }

    setStatus(
      state.mode === Mode.DAILY ? "Official Daily active." : "Practice active.",
      `${ROWS - state.currentRow} guesses remaining • Difficulty: ${state.difficulty === Difficulty.BEGINNER ? "Beginner" : "Player"}`
    );
  }

  // ===== TILE TYPING (hardware keyboard) =====
  function onKeyDown(e) {
    if (state.status !== "active") return;

    // Don’t interfere with Cmd/Ctrl shortcuts
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key;

    if (key === "Enter") {
      e.preventDefault();
      submitDraft();
      return;
    }

    if (key === "Backspace") {
      e.preventDefault();
      state.draft = state.draft.slice(0, -1);
      renderBoard();
      return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      if (state.draft.length < COLS) {
        state.draft += key.toUpperCase();
        renderBoard();
      }
    }
  }

  // ===== STATS UI =====
  function statsText() {
    const s = loadStats();
    return [
      `Total Played: ${s.totalPlayed}`,
      `Wins: ${s.totalWins}`,
      `Losses: ${s.totalLosses}`,
      `Current Streak: ${s.currentStreak}`,
      `Max Streak: ${s.maxStreak}`,
      ``,
      `Guess Distribution:`,
      `  1: ${s.guessDistribution[0]}`,
      `  2: ${s.guessDistribution[1]}`,
      `  3: ${s.guessDistribution[2]}`,
      `  4: ${s.guessDistribution[3]}`,
      `  5: ${s.guessDistribution[4]}`,
      `  6: ${s.guessDistribution[5]}`,
    ].join("\n");
  }

  function openStats() {
    statsBodyEl.textContent = statsText();
    statsModalEl.classList.remove("hidden");
  }

  function closeStats() {
    statsModalEl.classList.add("hidden");
  }

  function resetStats() {
    localStorage.removeItem(STORAGE_KEY_STATS);
    localStorage.removeItem(STORAGE_KEY_LAST_PLAYED);
    localStorage.removeItem(STORAGE_KEY_COMPLETED_TODAY);
    localStorage.removeItem(STORAGE_KEY_LAST_PLAYED);
    setStatus("Stats reset.", "Official Daily stats cleared.");
  }

  // ===== EVENTS =====
  modeDailyEl.addEventListener("click", () => startMode(Mode.DAILY));
  modePracticeEl.addEventListener("click", () => startMode(Mode.PRACTICE));
  btnEnterEl.addEventListener("click", submitDraft);

  // click board/keyboard area to keep focus for hardware typing
  boardEl.addEventListener("click", () => guessInputEl.focus());
  keyboardEl?.addEventListener("click", () => guessInputEl.focus());

  document.addEventListener("keydown", onKeyDown);

  btnStatsEl.addEventListener("click", openStats);
  btnCloseStatsEl.addEventListener("click", closeStats);
  statsModalEl.addEventListener("click", (e) => { if (e.target === statsModalEl) closeStats(); });

  btnResetStatsEl.addEventListener("click", () => {
    if (confirm("Reset Official Daily stats? This cannot be undone.")) resetStats();
  });

  diffBeginnerEl?.addEventListener("click", () => setDifficulty(Difficulty.BEGINNER));
  diffPlayerEl?.addEventListener("click", () => setDifficulty(Difficulty.PLAYER));

  // ===== INIT =====
  const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
  const savedDiff = localStorage.getItem(STORAGE_KEY_DIFFICULTY);

  state.mode = (savedMode === Mode.PRACTICE) ? Mode.PRACTICE : Mode.DAILY;
  state.difficulty = (savedDiff === Difficulty.PLAYER) ? Difficulty.PLAYER : Difficulty.BEGINNER;

  setModeButtons();
  setDifficultyButtons();
  renderDailyMessage();
  renderBoard();
  renderKeyboard();
  setStatus("Select a mode to begin.", "Official Daily tracks stats. Practice does not.");
  guessInputEl.focus();
})();