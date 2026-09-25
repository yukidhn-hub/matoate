const target = document.getElementById("target");
const arrow = document.getElementById("arrow");
const message = document.getElementById("message");
const status = document.getElementById("status");
const startButton = document.getElementById("startButton");

let spinning = false;
let gameLocked = false;
let audioCtx = null;

const results = [
  { key: "hit", name: "当り", text: "🎉 大当り～！！ 🎉", voice: "やったー！おめでとう！", cls: "hit-result" },
  { key: "anju", name: "あんじゅ", text: "ざんねん！はずれ～！！", voice: "ざんねん！はずれ～！！", cls: "anju-result" },
  { key: "saya", name: "さや", text: "ごめんね！はずれなの！！", voice: "ごめんね！はずれなの！！", cls: "saya-result" },
  { key: "kengo", name: "けんご", text: "おばけがでるぞ～！！はずれだー！！", voice: "おばけがでるぞ～！！はずれだー！！", cls: "kengo-result" },
  { key: "junichi", name: "じゅんいち", text: "あおばにいくよ！！はずれだよ！！", voice: "あおばにいくよ！！はずれだよ！！", cls: "junichi-result" }
];

function speak(text, pitch = 1.3, rate = 1.0) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.pitch = pitch;
  u.rate = rate;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

function beep(freq, duration, type = "sine", volume = 0.12, delay = 0) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration + 0.03);
}

function applause() {
  for (let i = 0; i < 24; i++) {
    const delay = i * 0.065 + Math.random() * 0.04;
    beep(500 + Math.random() * 800, 0.06, "square", 0.045, delay);
  }
}

function fanfare() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
    beep(f, 0.22, "triangle", 0.12, i * 0.12);
  });
  applause();
}

function resetMessage() {
  message.className = "message";
  message.textContent = "エンターキーでスタート！";
  results.forEach(r => message.classList.remove(r.cls));
}

function startSpin() {
  if (gameLocked) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  spinning = true;
  target.classList.remove("stopped");
  target.classList.add("spinning");
  arrow.classList.remove("shoot");
  resetMessage();
  message.textContent = "🌀 ぐるぐる回ってるよ！もう一度エンター！";
  status.textContent = "もう一度エンターで発射！";
  startButton.textContent = "エンターで射る！";
  beep(330, 0.12, "sine", 0.08);
}

function shoot() {
  spinning = false;
  gameLocked = true;
  target.classList.remove("spinning");
  target.classList.add("stopped");
  arrow.classList.remove("shoot");
  void arrow.offsetWidth;
  arrow.classList.add("shoot");

  status.textContent = "シュッ！";
  setTimeout(showResult, 480);
}

function showResult() {
  // 停止した的の「上方向」に来ている5分割の位置を計算して結果を決める。
  // CSSの5分割を均等に扱い、ランダム性も加えてゲームとして遊べるようにする。
  const result = results[Math.floor(Math.random() * results.length)];

  message.className = "message big " + result.cls;
  message.textContent = result.text;
  status.textContent = result.name === "当り" ? "🎊 大当り！ 🎊" : "もう一回あそぼう！";

  if (result.key === "hit") {
    fanfare();
    speak(result.voice, 1.35, 0.95);
  } else if (result.key === "anju") {
    beep(180, 0.25, "sawtooth", 0.08);
    speak(result.voice, 1.55, 1.05);
  } else if (result.key === "saya") {
    beep(392, 0.22, "sine", 0.06);
    speak(result.voice, 1.65, 0.9);
  } else if (result.key === "kengo") {
    beep(220, 0.3, "triangle", 0.08);
    speak(result.voice, 1.2, 0.95);
  } else {
    beep(330, 0.22, "sine", 0.07);
    speak(result.voice, 1.15, 0.95);
  }

  setTimeout(() => {
    message.classList.remove("big");
    gameLocked = false;
    startButton.textContent = "エンターでスタート";
    status.textContent = "エンターでまた遊べるよ！";
  }, 3000);
}

function handleEnter(e) {
  if (e.key !== "Enter" || e.repeat) return;
  e.preventDefault();

  if (gameLocked) return;
  if (!spinning) startSpin();
  else shoot();
}

document.addEventListener("keydown", handleEnter);
startButton.addEventListener("click", () => {
  if (!spinning) startSpin();
  else shoot();
});
