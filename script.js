// Rain Animation
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
let drops = [];

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Drop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * -canvasHeight;
        this.length = Math.random() * 25 + 15;
        this.speed = Math.random() * 12 + 8;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.thickness = Math.random() * 1.5 + 0.5;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(46, 204, 113, ${this.opacity})`;
        ctx.lineWidth = this.thickness;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
    }

    update() {
        this.y += this.speed;
        if (this.y > canvasHeight) {
            this.reset();
        }
    }
}

for (let i = 0; i < 120; i++) {
    drops.push(new Drop());
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drops.forEach(drop => {
        drop.draw();
        drop.update();
    });
    requestAnimationFrame(animate);
}

animate();

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
});

// Thumbnail Extraction Logic
const videoUrlInput = document.getElementById('videoUrl');
const extractBtn = document.getElementById('extractBtn');
const previewSection = document.getElementById('previewSection');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const qualityBtns = document.querySelectorAll('.quality-btn');
const downloadBtn = document.getElementById('downloadBtn');

let currentVideoId = '';
let currentQuality = 'maxresdefault';

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

extractBtn.addEventListener('click', () => {
    const url = videoUrlInput.value.trim();
    const videoId = extractVideoId(url);

    if (videoId) {
        currentVideoId = videoId;
        updatePreview();
        previewSection.classList.remove('hidden');
        previewSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Please enter a valid YouTube URL');
    }
});

function updatePreview() {
    // YouTube thumbnail quality mapping
    // maxresdefault -> 4K/8K (Best available)
    // hqdefault -> Normal
    // default -> Low
    const qualityMap = {
        'low': 'default',
        'normal': 'hqdefault',
        '4k': 'maxresdefault',
        '8k': 'maxresdefault' // No real 8k from public api, using maxres
    };

    const ytQuality = qualityMap[currentQuality] || 'maxresdefault';
    thumbnailPreview.src = `https://img.youtube.com/vi/${currentVideoId}/${ytQuality}.jpg`;
}

qualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        qualityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentQuality = btn.getAttribute('data-quality');
        updatePreview();
    });
});

// Download Functionality
downloadBtn.addEventListener('click', async () => {
    const imageUrl = thumbnailPreview.src;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `thumbnail_${currentVideoId}_${currentQuality}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        // Show Success Popup
        showPopup();
    } catch (error) {
        // Fallback if fetch fails (CORS issues possible with direct img.youtube.com)
        window.open(imageUrl, '_blank');
        showPopup();
    }
});

const successPopup = document.getElementById('successPopup');
const closePopup = document.getElementById('closePopup');

function showPopup() {
    successPopup.classList.remove('hidden');
}

closePopup.addEventListener('click', () => {
    successPopup.classList.add('hidden');
});

// Close popup on background click
successPopup.addEventListener('click', (e) => {
    if (e.target === successPopup) {
        successPopup.classList.add('hidden');
    }
});
