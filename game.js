document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const pumpHandle = document.getElementById("pump_handle");
    const airNuzzle = document.getElementById("air_nuzzle");
    const airPumpMachine = document.getElementById("air_pump_machine");
    const gameArea = document.getElementById("gameArea");
    const pauseButton = document.getElementById("pauseButton");

    // State variables
    let balloons = []; // Active balloons in the game
    let isPumping = false; // Flag to avoid rapid pumping actions
    let gamePaused = false; // Flag for game pause/resume state
    let pausedBalloonStates = []; // Store balloon states when game is paused

    const maxInflation = 4; // Number of clicks required to make a balloon fly
    const balloonImages = [
        "/images/pink ballon.png",
        "/images/red.png",
        "/images/green.png",
        "/images/blue.png",
        "/images/orange and Yellow.png",
        "/images/purple ballon.png",
        "/images/orange.png",
        "/images/pink.png",
    ];
    const alphabetImages = [
        "/images/a.png", "/images/b.png", "/images/c.png", "/images/d.png", "/images/e.png",
        "/images/f.png", "/images/g.png", "/images/h.png", "/images/i.png", "/images/j.png",
        "/images/k.png", "/images/l.png", "/images/m.png", "/images/n.png", "/images/o.png",
        "/images/p.png", "/images/q.png", "/images/r.png", "/images/s.png", "/images/t.png",
        "/images/u.png", "/images/v.png", "/images/w.png", "/images/x.png", "/images/y.png", "/images/z.png"
    ];

    // Function to create a new balloon element
    function createBalloon() {
        if (gamePaused) return; // Prevent balloon creation if the game is paused

        // Create balloon div and set initial styles
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");
        balloon.style.backgroundImage = `url(${getRandomBalloonImage()})`; 
        balloon.style.backgroundSize = "cover";
        balloon.style.position = "absolute";
        balloon.style.opacity = "0";
        balloon.style.left = "79%";
        balloon.style.bottom = "22%";
        balloon.style.cursor = "pointer";
        balloon.style.transform = "translateX(-50%) scale(0)";
        gameArea.appendChild(balloon);

        // Create and position alphabet image inside the balloon
        const alphabetImage = document.createElement("img");
        alphabetImage.classList.add("balloon-image");
        alphabetImage.src = getRandomAlphabetImage(); // Random alphabet image
        alphabetImage.style.position = "absolute"; 
        alphabetImage.style.top = "50%"; 
        alphabetImage.style.left = "50%"; 
        alphabetImage.style.transform = "translate(-50%, -50%)"; 
        alphabetImage.style.width = "60%"; 
        balloon.appendChild(alphabetImage);

        // Balloon data object
        const balloonData = {
            element: balloon,
            alphabetImage: alphabetImage,
            size: 60,
            clickCount: 0,
            isFloating: false,
            dx: -52 + Math.random() * 20 - 10, // Random horizontal velocity
            dy: -62 + Math.random() * 10 - 5,  // Random vertical velocity
        };

        // Balloon click event to trigger burst
        balloon.addEventListener("click", () => triggerBlast(balloonData));
        balloons.push(balloonData);
    }

    // Randomly select a balloon image
    function getRandomBalloonImage() {
        const randomIndex = Math.floor(Math.random() * balloonImages.length);
        return balloonImages[randomIndex];
    }

    // Randomly select an alphabet image
    function getRandomAlphabetImage() {
        const randomIndex = Math.floor(Math.random() * alphabetImages.length);
        return alphabetImages[randomIndex];
    }

    // Pump action logic (triggered at regular intervals)
    function pumpAction() {
        if (gamePaused || isPumping) return; // Prevent pumping when paused or in action

        isPumping = true;

        // Add pumping classes for visual effect
        pumpHandle.classList.add("pumping");
        airPumpMachine.classList.add("pumping");
        airNuzzle.classList.add("pumping");

        // After a brief delay, attempt to create or inflate a balloon
        setTimeout(() => {
            if (balloons.length === 0 || balloons.every(b => b.isFloating || !isBalloonVisible(b))) {
                createBalloon(); // Create a new balloon if needed
            }

            // Inflate the first visible, non-floating balloon
            const currentBalloon = balloons.find(b => !b.isFloating && isBalloonVisible(b));
            if (currentBalloon) {
                positionBalloonAtNozzle(currentBalloon);
                inflateBalloon(currentBalloon);
            }
        }, 300);

        // Reset the pumping visual effects after a brief delay
        setTimeout(() => {
            pumpHandle.classList.remove("pumping");
            airPumpMachine.classList.remove("pumping");
            airNuzzle.classList.remove("pumping");
            isPumping = false;
        }, 200);
    }

    // Check if a balloon is currently visible on the screen
    function isBalloonVisible(balloonData) {
        const balloonRect = balloonData.element.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        return balloonRect.top < screenHeight && balloonRect.bottom > 0 && balloonRect.left < screenWidth && balloonRect.right > 0;
    }

    // Position the balloon near the nozzle ready for inflation
    function positionBalloonAtNozzle(balloonData) {
        const balloon = balloonData.element;
        balloon.style.opacity = "1";
        balloon.style.left = "79%";
        balloon.style.bottom = "23%";
        balloon.style.transform = "translateX(-50%) scale(1.2)"; 
    }

    // Inflate the balloon by increasing its size
    function inflateBalloon(balloonData) {
        const balloon = balloonData.element;
        balloonData.clickCount++;
        balloonData.size += 20; // Increase balloon size with each pump

        // Adjust size of balloon
        const balloonWidth = balloonData.size * 1.2;
        const balloonHeight = balloonData.size * 1.2; 
        balloon.style.width = `${balloonWidth}px`;
        balloon.style.height = `${balloonHeight}px`;
        balloon.style.transform = `translateX(-50%)`;

        // Make the balloon fly once fully inflated
        if (balloonData.clickCount >= maxInflation && !balloonData.isFloating) {
            makeBalloonFly(balloonData);
        }
    }

    // Start making the balloon fly once it is inflated
    function makeBalloonFly(balloonData) {
        balloonData.isFloating = true;
        const balloon = balloonData.element;

        // Update the position of the balloon on each frame
        function updatePosition() {
            const balloonRect = balloon.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Reverse vertical direction if the balloon hits the top
            if (balloon.offsetTop <= 0) {
                balloonData.dy = Math.abs(balloonData.dy) * 0.9; 
            }

            // Remove balloon if it moves off-screen
            if (
                balloon.offsetTop > screenHeight ||
                balloon.offsetLeft + balloon.offsetWidth < 0 || 
                balloon.offsetLeft > screenWidth
            ) {
                removeBalloon(balloonData);
                return;
            }

            // Update the position based on velocities
            balloon.style.left = `${balloon.offsetLeft + balloonData.dx}px`;
            balloon.style.top = `${balloon.offsetTop + balloonData.dy}px`;

            // Continue animation if the balloon is still floating
            if (balloonData.isFloating) {
                requestAnimationFrame(updatePosition); 
            }
        }

        updatePosition(); 
    }

    // Remove balloon once it goes out of bounds
    function removeBalloon(balloonData) {
        const balloon = balloonData.element;

        if (balloon.parentNode) gameArea.removeChild(balloon);

        // Remove from active balloons list
        balloons = balloons.filter(b => b !== balloonData);
    }

    // Pause the game and stop balloon movement
    function pauseGame() {
        gamePaused = true;

        // Store current states of all balloons
        pausedBalloonStates = balloons.map(balloonData => ({
            x: balloonData.element.offsetLeft,
            y: balloonData.element.offsetTop,
            dx: balloonData.dx,
            dy: balloonData.dy,
            size: balloonData.size,
            clickCount: balloonData.clickCount,
            isFloating: balloonData.isFloating,
        }));

        // Stop balloon movement by setting velocities to zero
        balloons.forEach(balloonData => {
            balloonData.dx = 0;
            balloonData.dy = 0;
        });
    }

    // Resume the game and restore balloon states
    function resumeGame() {
        gamePaused = false;

        // Restore the state of each balloon
        pausedBalloonStates.forEach((savedState, index) => {
            const balloonData = balloons[index];
            if (balloonData) {
                balloonData.element.style.left = `${savedState.x}px`;
                balloonData.element.style.top = `${savedState.y}px`;
                balloonData.dx = savedState.dx;
                balloonData.dy = savedState.dy;
                balloonData.size = savedState.size;
                balloonData.clickCount = savedState.clickCount;
                balloonData.isFloating = savedState.isFloating;

                // Restart balloon movement if it was floating
                if (balloonData.isFloating) {
                    startBalloonMovement(balloonData);
                }
            }
        });
    }

    // Restart the balloon movement after resuming
    function startBalloonMovement(balloonData) {
        function updatePosition() {
            const balloon = balloonData.element;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            if (balloon.offsetTop <= 0) {
                balloonData.dy = Math.abs(balloonData.dy) * 0.9;
            }

            if (
                balloon.offsetTop > screenHeight ||
                balloon.offsetLeft + balloon.offsetWidth < 0 ||
                balloon.offsetLeft > screenWidth
            ) {
                removeBalloon(balloonData);
                return;
            }

            balloon.style.left = `${balloon.offsetLeft + balloonData.dx}px`;
            balloon.style.top = `${balloon.offsetTop + balloonData.dy}px`;

            if (balloonData.isFloating) {
                requestAnimationFrame(updatePosition);
            }
        }

        updatePosition();
    }

    // Trigger a balloon "pop" with particles
    function triggerBlast(balloonData) {
        if (!balloonData.isFloating || gamePaused) return;

        const balloon = balloonData.element;
        const rect = balloon.getBoundingClientRect();

        // Get the center position of the balloon for the blast
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create particles for the blast effect
        createRealisticParticles(centerX, centerY, 3);

        // Apply blast animation and play sound
        balloon.classList.add("balloon-blast");
        const popSound = document.getElementById("popSound");
        if (popSound) {
            popSound.currentTime = 0; 
            popSound.play();
        }

        // Remove balloon after animation
        setTimeout(() => {
            removeBalloon(balloonData);
        }, 300); // Match animation duration
    }

    // Create realistic particles for the blast effect
    function createRealisticParticles(x, y, blastRadius) {
        const particleCount = 30;
        const gravity = 0.3; 
        const lifetime = 1500;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");

            // Set initial particle styles
            particle.style.position = "absolute";
            particle.style.width = `${Math.random() * 8 + 4}px`;
            particle.style.height = particle.style.width;
            particle.style.borderRadius = "50%";
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random color
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            gameArea.appendChild(particle);

            // Set random velocity for the particle
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * blastRadius + 2;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            let currentX = x;
            let currentY = y;

            // Animate the particle's movement
            const startTime = performance.now();
            function animateParticle(time) {
                const elapsedTime = time - startTime;
                const progress = elapsedTime / lifetime;

                if (progress < 1) {
                    currentX += velocityX;
                    currentY += velocityY + gravity * progress;

                    particle.style.left = `${currentX - particle.offsetWidth / 2}px`;
                    particle.style.top = `${currentY - particle.offsetHeight / 2}px`;

                    requestAnimationFrame(animateParticle);
                } else {
                    // Remove particle after lifetime
                    particle.remove();
                }
            }
            requestAnimationFrame(animateParticle);
        }
    }

    // Pause button event listener
    pauseButton.addEventListener("click", () => {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    // Start the pump action interval
    setInterval(pumpAction, 168);

    // Function to auto-adjust layout based on screen size and aspect ratio
    function adjustLayout() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Calculate the aspect ratio and scale the game accordingly
        const scaleX = screenWidth / AuthenticatorAssertionResponse;
        const scaleY = screenHeight / AuthenticatorAssertionResponse;
        const scale = Math.min(scaleX, scaleY); // Choose the smaller scale factor to maintain aspect ratio

        // Apply scaling transformation to the game area
        gameArea.style.transform = `scale(${scale})`;
        gameArea.style.transformOrigin = "top left"; // Ensure scaling happens from the top-left corner
    }

    // Listen for window resize events to adjust layout dynamically
    window.addEventListener("resize", adjustLayout);

    // Initial layout adjustment
    adjustLayout();
});
