let numbers = [];
let missingIndex = 0;
let optionValues = [];
let correctAnswer = 0;

let skor = 0;
let waktu = 60;
let timerInterval = null;
let timerStarted = false;
let username = ""; 
 

const LEADERBOARD_KEY = "logic_highscore_list";
const MAX_LEADERBOARD = 100;
  
let highScores = getHighScores();
let maxScore = highScores.length > 0 ? highScores[0].score : 0;
document.getElementById("highscore").textContent = "Skor Terbaik: " + maxScore;

const boxesEl = document.getElementById('boxes');
const optionsEl = document.getElementById('options');
const resultEl = document.getElementById('result');
const leaderboardEl = document.getElementById('leaderboard');
const overlayLeaderboardEl = document.getElementById('overlay-leaderboard');
const overlayLeaderboardContainerEl = document.getElementById('overlay-leaderboard-container');
  
const menuOverlayEl = document.getElementById('menu-overlay');
const menuBtnMulai = document.getElementById('btnMulai');
const menuBtnLihatLeaderboard = document.getElementById('btnLihatLeaderboard');
const menuBtnKembali = document.getElementById('btnKembali');
const btnNewGame = document.getElementById("btnNew");
const btnBackToMenu = document.getElementById("btnBackToMenu");
  
const usernameInputMenuEl = document.getElementById('username-input-menu');


// --- Fungsi Utilitas ---
function rand(min, max){ return Math.floor(Math.random()*(max-min+1)) + min; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=rand(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// --- Fungsi Leaderboard ---
function getHighScores(){
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveNewScore(newScore){
    const finalUsername = username.trim() === "" ? 'Anonim' : username;
    const now = new Date();
      
    const newEntry = {
        score: newScore,
        username: finalUsername, 
        date: now.toLocaleDateString('id-ID'), 
        time: now.toLocaleTimeString('id-ID') 
    };

    highScores.push(newEntry);
    highScores.sort((a,b)=>b.score - a.score); 

    if(highScores.length > MAX_LEADERBOARD){
        highScores = highScores.slice(0, MAX_LEADERBOARD);
    }

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(highScores));
      
    maxScore = highScores.length > 0 ? highScores[0].score : 0;
    document.getElementById("highscore").textContent = "Skor Terbaik: " + maxScore;

    renderLeaderboard();
}
  
function renderLeaderboard(){
    leaderboardEl.innerHTML = '';
    if(highScores.length === 0){
        leaderboardEl.innerHTML = '<li style="justify-content:center; color:var(--muted);">Belum ada skor</li>';
        return;
    }
      
    highScores.forEach((entry, index)=>{
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span>${entry.username} (${entry.date} ${entry.time})</span>
            <span class="score">${entry.score}</span>
        `;
        leaderboardEl.appendChild(li);
    });
}
  
function renderOverlayLeaderboard(){
    overlayLeaderboardEl.innerHTML = '';
    const topScores = highScores.slice(0, 10);

    if(topScores.length === 0){
        overlayLeaderboardEl.innerHTML = '<li style="justify-content:center; color:var(--muted);">Belum ada skor</li>';
        return;
    }

    topScores.forEach((entry, index)=>{
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span>${entry.username} (${entry.date})</span>
            <span class="score">${entry.score}</span>
        `;
        overlayLeaderboardEl.appendChild(li);
    });
}
  
// --- Logika Menu ---
function hideOverlay(el){
    el.classList.add('hidden');
}

function showMenu(){
    clearInterval(timerInterval);
    skor = 0;
    timerStarted = false;
    document.getElementById("skor").textContent = "Skor: 0";
    document.getElementById("timer").textContent = "Waktu: 60";
    resultEl.textContent = "";
    optionsEl.innerHTML = "";
    boxesEl.innerHTML = ""; 
    username = ""; 

    menuOverlayEl.classList.remove('hidden');
      
    menuBtnLihatLeaderboard.style.display = 'block';
    menuBtnMulai.style.display = 'block';
    usernameInputMenuEl.style.display = 'block';
    overlayLeaderboardContainerEl.style.display = 'none';
    usernameInputMenuEl.focus();
}
  
function hideMenu(){
    hideOverlay(menuOverlayEl);
}

function showLeaderboard(){
    renderOverlayLeaderboard();
    menuBtnLihatLeaderboard.style.display = 'none';
    menuBtnMulai.style.display = 'none';
    usernameInputMenuEl.style.display = 'none'; 
    overlayLeaderboardContainerEl.style.display = 'block';
}
  
menuBtnMulai.onclick = () => {
    let inputName = usernameInputMenuEl.value.trim().substring(0, 15);
    username = inputName === "" ? 'Anonim' : inputName;
      
    hideMenu();
    mulaiUlangGame();
};
  
menuBtnLihatLeaderboard.onclick = () => {
    showLeaderboard();
};
  
menuBtnKembali.onclick = () => {
    showMenu();
};
  
usernameInputMenuEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        menuBtnMulai.click();
    }
});


// --- Logika Game Soal ---
function buatSoalLogika(){
    const start = rand(1,20);
    const step = rand(2,9); 

    numbers = [];
    for(let i=0;i<5;i++){
        numbers.push(start + i * step);
    }

    missingIndex = rand(0,4); 
    correctAnswer = numbers[missingIndex];
}

function buatPilihan(){
    let pilihan = [correctAnswer];

    while(pilihan.length < 5){
        let p = correctAnswer + rand(-7,7); 
        if(p === correctAnswer || p < 1 || pilihan.includes(p)) continue; 
        pilihan.push(p);
    }
    optionValues = shuffle(pilihan);
}

function render(){
    boxesEl.innerHTML = "";
    numbers.forEach((num,i)=>{
        const d = document.createElement("div");
        d.className = "box" + (i===missingIndex ? " empty" : "");
        d.textContent = (i===missingIndex ? "?" : num);
        boxesEl.appendChild(d);
    });

    optionsEl.innerHTML = "";
    optionValues.forEach(val=>{
        const opt = document.createElement("div");
        opt.className = "opt";
        opt.textContent = val;
        opt.onclick = ()=> pilih(val,opt);
        optionsEl.appendChild(opt);
    });

    resultEl.textContent = "";

    boxesEl.classList.add("fade-in");
    optionsEl.classList.add("fade-in");
    setTimeout(()=>{
        boxesEl.classList.remove("fade-in");
        optionsEl.classList.remove("fade-in");
    },200); // Waktu fade dipercepat
}

function pilih(val, el){
    if(waktu <= 0) return; 

    if(!timerStarted){
        mulaiTimer();
        timerStarted = true;
    }

    Array.from(optionsEl.children).forEach(x=>x.style.pointerEvents="none");

    const kotakKosong = boxesEl.children[missingIndex];
    kotakKosong.textContent = val;
    kotakKosong.classList.remove("empty");

    if(parseInt(val) === correctAnswer){ 
        skor++;
        resultEl.style.color = "var(--correct)";
        resultEl.textContent = "Benar! 🎉";
        // EFEK CEPAT: Kotak yang diisi menjadi hijau
        kotakKosong.style.background = "var(--correct)"; 
        kotakKosong.style.border = "2px solid var(--correct)";
        el.style.border = "3px solid var(--correct)";
    } else {
        resultEl.style.color = "var(--wrong)";
        resultEl.textContent = "Salah! Jawaban yang benar: " + correctAnswer;
        // EFEK CEPAT: Kotak yang diisi menjadi merah
        kotakKosong.style.background = "var(--wrong)"; 
        kotakKosong.style.border = "2px solid var(--wrong)";
        el.style.border = "3px solid var(--wrong)";
          
        // Sorot jawaban yang benar (border hijau pada opsi yang benar)
        Array.from(optionsEl.children).forEach(o=>{
            if(parseInt(o.textContent) === correctAnswer){
                o.style.border = "3px solid var(--correct)";
            }
        });
    }

    document.getElementById("skor").textContent = "Skor: " + skor;

    // HILANGKAN DELAY: Panggil fungsi pergantian soal lebih cepat
    fadePergantian();
}

function fadePergantian(){
    boxesEl.classList.add("fade-out");
    optionsEl.classList.add("fade-out");

    // HILANGKAN DELAY: Pergantian soal hanya dalam waktu transisi CSS
    setTimeout(()=>{
        boxesEl.classList.remove("fade-out");
        optionsEl.classList.remove("fade-out");
        soalBaru();
    },200); // Waktu yang sama dengan fade transition di CSS
}

function soalBaru(){
    buatSoalLogika();
    buatPilihan();
    render();
    Array.from(optionsEl.children).forEach(x=>x.style.pointerEvents="auto");
}

// --- Logika Timer & Game Over ---
function mulaiTimer(){
    clearInterval(timerInterval);
    waktu = 60;
    document.getElementById("timer").textContent = "Waktu: 60";
    timerInterval = setInterval(()=>{
        waktu--;
        document.getElementById("timer").textContent = "Waktu: " + waktu;
        if(waktu <= 0){
            clearInterval(timerInterval);
            gameOver();
        }
    },1000);
}

function gameOver(){
    resultEl.style.color = "var(--accent)";
    resultEl.textContent = "⏳ Waktu Habis! Skor Akhir: " + skor;
      
    optionsEl.innerHTML = "";
    boxesEl.innerHTML = ""; 
      
    if(skor > 0){
        saveNewScore(skor);
    }
      
    // Kembali ke menu setelah 2 detik
    setTimeout(()=>{
        showMenu();
        usernameInputMenuEl.value = ""; 
    }, 2000);
}
  
function mulaiUlangGame(){
    skor = 0;
    timerStarted = false;
    clearInterval(timerInterval);

    document.getElementById("skor").textContent = "Skor: 0";
    document.getElementById("timer").textContent = "Waktu: 60";
    resultEl.textContent = "";

    soalBaru();
}

// --- Event Listeners Aksi ---
btnNewGame.onclick = mulaiUlangGame;
btnBackToMenu.onclick = showMenu; 

// Inisialisasi: Tampilkan Menu
renderLeaderboard(); 
showMenu();
mulaiUlangGame(); // Panggil ini untuk inisialisasi soal pertama, namun game belum dimulai sampai jawaban pertama dipilih.