// ===================================
// CANVAS SETUP
// ===================================
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let animationFrame;
let mouseX = -1000;
let mouseY = -1000;
let textBottomY = 0;

// Resize canvas to full screen
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    calculateTextBottom();
}

// Calculate where text ends
function calculateTextBottom() {
    const content = document.querySelector('.hero-content');
    if (content) {
        const rect = content.getBoundingClientRect();
        textBottomY = rect.bottom + 80; // 80px spacing below text
    } else {
        textBottomY = height * 0.4; // Fallback to 40% of screen (since text is in top third)
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Track mouse position
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

// ===================================
// BAR CONFIGURATION
// ===================================
const BAR_COUNT = 20; // Fewer bars = wider bars
const BAR_WIDTH = width / BAR_COUNT;
const BOUNCE_DURATION = 2000; // 2 seconds for initial bounce
const startTime = Date.now();

// Green gradient colors
const COLOR_DARK = { r: 28, g: 78, b: 75 };      // Primary Evergreen (darkest)
const COLOR_BRIGHT = { r: 240, g: 250, b: 245 }; // Almost white with green tint

class Bar {
    constructor(index) {
        this.index = index;
        this.x = index * BAR_WIDTH;
        this.width = BAR_WIDTH;
        
        // Create wave pattern using multiple sine waves
        const position = index / BAR_COUNT;
        const wave1 = Math.sin(position * Math.PI * 3) * 0.3;
        const wave2 = Math.sin(position * Math.PI * 1.5 + Math.PI / 4) * 0.2;
        const wave3 = Math.sin(position * Math.PI * 0.5) * 0.15;
        const combinedWave = (wave1 + wave2 + wave3) * 0.5 + 0.5; // Normalize to 0-1
        
        // Base height varies between 30% and 85% of available space (taller bars)
        const availableHeight = height - textBottomY;
        this.baseHeight = availableHeight * (0.3 + combinedWave * 0.55);
        this.height = this.baseHeight;
        
        // Initial bounce animation properties
        this.bounceDelay = index * 30; // Staggered start
        this.bounceAmplitude = 100 + Math.random() * 150;
        this.bounceSpeed = 0.003 + Math.random() * 0.002;
        this.bouncePhase = Math.random() * Math.PI * 2;
        
        // Mouse interaction properties
        this.targetHeight = this.baseHeight;
        this.smoothing = 0.15; // Smooth follow
    }

    update(elapsed) {
        // Initial bounce animation
        if (elapsed < BOUNCE_DURATION) {
            const bounceElapsed = Math.max(0, elapsed - this.bounceDelay);
            if (bounceElapsed > 0) {
                // Damped sine wave for bounce
                const dampening = Math.max(0, 1 - (bounceElapsed / BOUNCE_DURATION));
                const bounce = Math.sin(bounceElapsed * this.bounceSpeed + this.bouncePhase) * 
                              this.bounceAmplitude * dampening;
                this.targetHeight = this.baseHeight + Math.abs(bounce);
            }
        } else {
            // Mouse interaction after bounce
            const barCenterX = this.x + this.width / 2;
            const distance = Math.abs(mouseX - barCenterX);
            const maxInfluence = 250; // Pixels of influence
            
            if (distance < maxInfluence && mouseX > 0) {
                // Calculate lift based on proximity
                const influence = 1 - (distance / maxInfluence);
                const lift = influence * influence * 180; // Quadratic falloff
                this.targetHeight = this.baseHeight + lift;
            } else {
                this.targetHeight = this.baseHeight;
            }
        }
        
        // Smooth interpolation toward target
        this.height += (this.targetHeight - this.height) * this.smoothing;
    }

    draw() {
        // Calculate Y position (bars grow upward from bottom)
        const y = height - this.height;
        const centerY = height - this.height / 2; // Middle of the bar
        
        // Create three-part gradient: black top -> bright center -> dark bottom
        const gradient = ctx.createLinearGradient(this.x, y, this.x, height);
        
        // Top: fade to pure black (transparent into background)
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(0.05, `rgba(${COLOR_DARK.r}, ${COLOR_DARK.g}, ${COLOR_DARK.b}, 0.2)`);
        gradient.addColorStop(0.15, `rgba(${COLOR_DARK.r}, ${COLOR_DARK.g}, ${COLOR_DARK.b}, 0.5)`);
        
        // Center: brightest point (almost white with green tint)
        gradient.addColorStop(0.5, `rgba(${COLOR_BRIGHT.r}, ${COLOR_BRIGHT.g}, ${COLOR_BRIGHT.b}, 0.95)`);
        
        // Bottom: back to dark
        gradient.addColorStop(0.85, `rgba(${COLOR_DARK.r}, ${COLOR_DARK.g}, ${COLOR_DARK.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${COLOR_DARK.r}, ${COLOR_DARK.g}, ${COLOR_DARK.b}, 0.8)`);
        
        // Draw bar
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, y, this.width, this.height);
        
        // Add subtle border for definition (only visible portion)
        ctx.strokeStyle = `rgba(${COLOR_DARK.r}, ${COLOR_DARK.g}, ${COLOR_DARK.b}, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, y + this.height * 0.1); // Start border 10% down
        ctx.lineTo(this.x, height);
        ctx.stroke();
    }
}

// ===================================
// CREATE BARS
// ===================================
const bars = [];
for (let i = 0; i < BAR_COUNT; i++) {
    bars.push(new Bar(i));
}

// ===================================
// MAIN ANIMATION LOOP
// ===================================
function animate() {
    const elapsed = Date.now() - startTime;

    // Clear canvas with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Update and draw all bars
    bars.forEach(bar => {
        bar.update(elapsed);
        bar.draw();
    });

    animationFrame = requestAnimationFrame(animate);
}

// Start animation
animate();

// ===================================
// TEXT REVEAL ANIMATION
// ===================================
// Text reveals after initial bounce settles
setTimeout(() => {
    const content = document.querySelector('.hero-content');
    content.style.animation = 'revealText 1.5s ease-out forwards';
    
    // Recalculate text bottom after reveal
    setTimeout(() => {
        calculateTextBottom();
    }, 100);
    
    // Start typewriter effect after text reveals
    setTimeout(() => {
        startTypewriter();
    }, 1500);
}, 1000);

// ===================================
// TYPEWRITER ANIMATION
// ===================================
const phrases = [
    "give everyone 100 healthy years of life<span class='accent-color'>.</span>",
    "save 30M lives each year<span class='accent-color'>.</span>",
    "manage 2B people's chronic illness<span class='accent-color'>.</span>",
    "save $2T in healthcare costs<span class='accent-color'>.</span>"
];
const finalPhrase = "Stop chronic <span class='accent-color'>inflammation.</span>";

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isPaused = false;
let isComplete = false;

const typedTextElement = document.getElementById('typed-text');
const typingSpeed = 80; // ms per character
const deletingSpeed = 40; // ms per character
const pauseDuration = 2000; // pause at end of phrase
const pauseAfterDelete = 500; // pause after deleting

function typeWriter() {
    if (isComplete) return;
    
    // If we've cycled through all phrases, type the final message
    if (phraseIndex >= phrases.length) {
        // Create a temporary div to parse HTML and count actual characters
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = finalPhrase;
        const plainText = tempDiv.textContent;
        
        if (charIndex < plainText.length) {
            // Build the HTML string character by character
            let htmlOutput = '';
            let plainIndex = 0;
            let i = 0;
            
            while (plainIndex <= charIndex && i < finalPhrase.length) {
                if (finalPhrase[i] === '<') {
                    // Copy HTML tag
                    const tagEnd = finalPhrase.indexOf('>', i);
                    htmlOutput += finalPhrase.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                } else {
                    htmlOutput += finalPhrase[i];
                    plainIndex++;
                    i++;
                }
            }
            
            typedTextElement.innerHTML = htmlOutput;
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Hide cursor when complete
            document.querySelector('.cursor').style.display = 'none';
            isComplete = true;
        }
        return;
    }
    
    const currentPhrase = phrases[phraseIndex];
    
    // Create a temporary div to parse HTML and count actual characters
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentPhrase;
    const plainText = tempDiv.textContent;
    
    if (!isDeleting && charIndex < plainText.length) {
        // Typing - build HTML string character by character
        let htmlOutput = '';
        let plainIndex = 0;
        let i = 0;
        
        while (plainIndex <= charIndex && i < currentPhrase.length) {
            if (currentPhrase[i] === '<') {
                // Copy HTML tag
                const tagEnd = currentPhrase.indexOf('>', i);
                htmlOutput += currentPhrase.substring(i, tagEnd + 1);
                i = tagEnd + 1;
            } else {
                htmlOutput += currentPhrase[i];
                plainIndex++;
                i++;
            }
        }
        
        typedTextElement.innerHTML = htmlOutput;
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
    } else if (!isDeleting && charIndex === plainText.length) {
        // Finished typing, pause before deleting
        isPaused = true;
        setTimeout(() => {
            isPaused = false;
            isDeleting = true;
            typeWriter();
        }, pauseDuration);
    } else if (isDeleting && charIndex > 0) {
        // Deleting - build HTML string character by character (in reverse)
        let htmlOutput = '';
        let plainIndex = 0;
        let i = 0;
        
        while (plainIndex < charIndex - 1 && i < currentPhrase.length) {
            if (currentPhrase[i] === '<') {
                // Copy HTML tag
                const tagEnd = currentPhrase.indexOf('>', i);
                htmlOutput += currentPhrase.substring(i, tagEnd + 1);
                i = tagEnd + 1;
            } else {
                htmlOutput += currentPhrase[i];
                plainIndex++;
                i++;
            }
        }
        
        typedTextElement.innerHTML = htmlOutput;
        charIndex--;
        setTimeout(typeWriter, deletingSpeed);
    } else if (isDeleting && charIndex === 0) {
        // Finished deleting, move to next phrase
        isDeleting = false;
        phraseIndex++;
        setTimeout(typeWriter, pauseAfterDelete);
    }
}

function startTypewriter() {
    typeWriter();

}
