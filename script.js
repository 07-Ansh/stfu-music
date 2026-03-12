const notes = {
    'a': 261.63, 'w': 277.18, 's': 293.66, 'e': 311.13,
    'd': 329.63, 'f': 349.23, 't': 369.99, 'g': 392.00,
    'y': 415.30, 'h': 440.00, 'u': 466.16, 'j': 493.88,
    'k': 523.25
};

let audioCtx, masterGain, bellows = 0, lastAngle = 0;
let activeOscs = {};

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('stfu-theme');

if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('stfu-theme', next);
});

let reverbNode = null;

function createReverbBuffer(ctx) {
    const length = ctx.sampleRate * 2.5;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (ctx.sampleRate * 0.4));
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
}

const initAudio = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;

    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = createReverbBuffer(audioCtx);
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.5;

    reverbNode.connect(reverbGain);
    reverbGain.connect(audioCtx.destination);
    masterGain.connect(audioCtx.destination);
    masterGain.connect(reverbNode);

    const tip = document.getElementById('status-tip');
    tip.classList.add('active');
    tip.querySelector('span:last-child').textContent = 'noise permit granted — go off 🎵';
};

window.addEventListener('mousedown', initAudio);
window.addEventListener('keydown', initAudio);

const connBadge = document.getElementById('conn-badge');
const connLabel = document.getElementById('conn-label');

function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:8765');

    socket.onopen = () => {
        connBadge.className = 'connection-badge connected';
        connLabel.textContent = 'lid is watching 👀';
    };

    socket.onclose = () => {
        connBadge.className = 'connection-badge disconnected';
        connLabel.textContent = 'lid on break 💤';
        setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = () => {
        connBadge.className = 'connection-badge disconnected';
        connLabel.textContent = 'lid on break 💤';
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const angle = data.angle;

        if (lastAngle > 0) {
            const diff = lastAngle - angle;
            if (diff > 0.5) bellows = Math.min(1.0, bellows + (diff * 0.08));
        }
        lastAngle = angle;
        document.getElementById('angle-display').textContent = `air in the lungs · lid ${Math.round(angle)}°`;
    };
}

connectWebSocket();

setInterval(() => {
    bellows = Math.max(0, bellows - 0.015);
    document.getElementById('fill').style.width = `${bellows * 100}%`;
    document.getElementById('fill').className = `bellows-fill ${bellows > 0.05 ? 'has-air' : ''}`;

    if (masterGain) masterGain.gain.setTargetAtTime(bellows * 1.5, audioCtx.currentTime, 0.05);
}, 50);

function playNote(key, el) {
    if (!notes[key] || activeOscs[key] || !audioCtx) return;
    const freq = notes[key];

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const osc3 = audioCtx.createOscillator();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sawtooth';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq / 2;
    osc3.frequency.value = freq + 1.0;

    const g1 = audioCtx.createGain(); g1.gain.value = 0.6;
    const g2 = audioCtx.createGain(); g2.gain.value = 0.5;
    const g3 = audioCtx.createGain(); g3.gain.value = 0.06;

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 0;

    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);

    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.08);

    filter.connect(g);
    g.connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    activeOscs[key] = { oscs: [osc1, osc2, osc3], gain: g };
    if (el) el.classList.add('active');
}

function stopNote(key, el) {
    if (!activeOscs[key]) return;
    const g = activeOscs[key].gain;

    g.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);

    activeOscs[key].oscs.forEach(o => o.stop(audioCtx.currentTime + 1.0));
    delete activeOscs[key];
    if (el) el.classList.remove('active');
}

window.onkeydown = (e) => {
    const key = e.key.toLowerCase();
    playNote(key, document.getElementById(`key-${key}`));
};

window.onkeyup = (e) => {
    const key = e.key.toLowerCase();
    stopNote(key, document.getElementById(`key-${key}`));
};

document.querySelectorAll('.key').forEach(keyEl => {
    const keyId = keyEl.id.replace('key-', '');

    keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        initAudio();
        playNote(keyId, keyEl);
        bellows = Math.max(bellows, 0.5);
    });

    const stop = () => stopNote(keyId, keyEl);
    keyEl.addEventListener('pointerup', stop);
    keyEl.addEventListener('pointerleave', stop);
});

const cheaterToggle = document.getElementById('cheater-toggle');
const cheaterPanel = document.getElementById('cheater-panel');

cheaterToggle.addEventListener('click', () => {
    cheaterToggle.classList.toggle('open');
    cheaterPanel.classList.toggle('open');
});

const autoPumpBtn = document.getElementById('auto-pump');
let autoPumpOn = false;
let autoPumpInterval = null;

autoPumpBtn.addEventListener('click', () => {
    initAudio();
    autoPumpOn = !autoPumpOn;
    if (autoPumpOn) {
        autoPumpBtn.classList.add('active');
        autoPumpBtn.textContent = 'auto pump: on 🔥';
        autoPumpInterval = setInterval(() => {
            bellows = Math.min(1.0, bellows + 0.04);
        }, 50);
    } else {
        autoPumpBtn.classList.remove('active');
        autoPumpBtn.textContent = 'auto pump: off 💨';
        if (autoPumpInterval) { clearInterval(autoPumpInterval); autoPumpInterval = null; }
    }
});
