document.addEventListener("DOMContentLoaded", () => {
    const image = document.getElementById("clickable-image");

    image.addEventListener("click", () => {
        // Move image down
        const currentTop = parseInt(window.getComputedStyle(image).top, 10) || 0;
        image.style.top = `${currentTop + 50}px`;

        // Generate a balloon
        const balloon = document.createElement("div");
        balloon.className = "balloon";
        balloon.style.left = `${image.offsetLeft + image.width / 2 - 25}px`;
        balloon.style.top = `${image.offsetTop}px`;
        document.body.appendChild(balloon);

        // Remove balloon after animation
        balloon.addEventListener("animationend", () => {
            balloon.remove();
        });
    });
});

// Create particle elements for the blast effect
// Create particle elements for a customizable blast effect with adjustable radius
function createRealisticParticles(x, y, blastRadius) {
    const particleCount = 30; // More particles for a richer effect
    const gravity = 0.3; // Simulate gravity pulling particles downward
    const lifetime = 1500; // Particle lifespan in milliseconds

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Initial styling for the particle
        particle.style.position = "absolute";
        particle.style.width = `${Math.random() * 8 + 4}px`; // Random size between 4px and 12px
        particle.style.height = particle.style.width;
        particle.style.borderRadius = "50%";
        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random colors
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Add particle to the game area
        gameArea.appendChild(particle);

        // Set random velocities for particles based on the blast radius
        const angle = Math.random() * 2 * Math.PI; // Random direction
        const speed = Math.random() * blastRadius + 2; // Adjust speed based on blast radius
        const velocityX = Math.cos(angle) * speed; // X velocity
        const velocityY = Math.sin(angle) * speed; // Y velocity

        let currentX = x;
        let currentY = y;

        // Animate the particle using `requestAnimationFrame`
        const startTime = performance.now();

        function animateParticle(time) {
            const elapsed = time - startTime;

            // Update position based on velocity and gravity
            currentX += velocityX;
            currentY += velocityY + gravity * (elapsed / 1000); // Gravity effect over time

            // Apply updated position and opacity
            particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px)`;
            particle.style.opacity = `${1 - elapsed / lifetime}`;

            if (elapsed < lifetime) {
                requestAnimationFrame(animateParticle);
            } else {
                // Remove particle after it fades out
                if (particle.parentNode) gameArea.removeChild(particle);
            }
        }

        requestAnimationFrame(animateParticle);
    }
}




// Trigger balloon blast (pop) with particles
// Trigger balloon blast with adjustable radius
function triggerBlast(balloonData) {
    const balloon = balloonData.element;
    const rect = balloon.getBoundingClientRect();

    // Get the center position of the balloon
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Define the blast radius (you can adjust this value)
    const blastRadius = 3; // Example value, you can change it

    // Create realistic particles with the specified blast radius
    createRealisticParticles(centerX, centerY, blastRadius);

    // Add animation class for balloon blast
    balloon.classList.add("balloon-blast");

    // Play pop sound
    const popSound = document.getElementById("popSound");
    if (popSound) {
        popSound.currentTime = 0; // Reset sound
        popSound.play();
    }

    // Remove balloon after animation
    setTimeout(() => {
        removeBalloon(balloonData);
    }, 300); // Match CSS animation duration
}
