console.log('Script loaded successfully');

// Mission Rotator with Typewriter Effect
const missionTexts = [
    'Save 30M lives each year',
    'Manage 2B cases of chronic inflammation',
    'Extend the average healthspan past 100 years',
    'Save $2T in healthcare costs',
    'Stop Chronic Inflammation'
];

const missionRotator = document.getElementById('missionRotator');
let currentMissionIndex = 0;
let isTyping = false;
let isDeleting = false;
let currentText = '';
let charIndex = 0;

// Create a single display element for the typewriter effect
missionRotator.innerHTML = '<div class="mission-item active typewriter"></div>';
const displayElement = missionRotator.querySelector('.typewriter');

// Create cursor element
const cursor = document.createElement('span');
cursor.className = 'cursor';

function typeWriter() {
    if (currentMissionIndex >= missionTexts.length) {
        console.log('Typewriter complete - showing final message');
        cursor.remove(); // Remove cursor from final message
        return; // Stop on last mission
    }

    const fullText = missionTexts[currentMissionIndex];
    
    if (!isDeleting && charIndex <= fullText.length) {
        // Typing
        currentText = fullText.substring(0, charIndex);
        displayElement.textContent = currentText;
        displayElement.appendChild(cursor); // Add cursor after text
        charIndex++;
        
        if (charIndex > fullText.length) {
            // Finished typing, wait 3 seconds
            console.log('Finished typing:', fullText);
            setTimeout(() => {
                if (currentMissionIndex < missionTexts.length - 1) {
                    isDeleting = true;
                    typeWriter();
                }
                // If it's the last mission, don't delete
            }, 3000);
        } else {
            setTimeout(typeWriter, 90); // Typing speed
        }
    } else if (isDeleting && charIndex > 0) {
        // Deleting
        charIndex--;
        currentText = fullText.substring(0, charIndex);
        displayElement.textContent = currentText;
        displayElement.appendChild(cursor); // Keep cursor during deletion
        
        if (charIndex === 0) {
            // Finished deleting, move to next mission
            isDeleting = false;
            currentMissionIndex++;
            console.log('Moving to mission index:', currentMissionIndex);
            setTimeout(typeWriter, 200); // Pause before next message
        } else {
            setTimeout(typeWriter, 50); // Deleting speed
        }
    }
}

// Start typewriter after initial delay
setTimeout(() => {
    console.log('Starting typewriter animation...');
    typeWriter();
}, 1500);

// Mouse parallax effect (disabled on mobile)
const parallaxElements = document.querySelectorAll('.parallax-element');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
const isMobile = window.innerWidth <= 768;

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
}

function animateParallax() {
    if (!isMobile) {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;

        parallaxElements.forEach((element, index) => {
            const multiplier = index === 0 ? 1 : -1;
            const scale = 8;
            
            const translateX = currentX * multiplier * scale;
            const translateY = currentY * multiplier * scale;
            
            element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    } else {
        // Reset transforms on mobile
        parallaxElements.forEach((element) => {
            element.style.transform = 'none';
        });
    }

    requestAnimationFrame(animateParallax);
}

animateParallax();

console.log('Script execution complete');
