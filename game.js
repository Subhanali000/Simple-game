document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const pumpHandle = document.getElementById("pump_handle");
    const airNuzzle = document.getElementById("air_nuzzle");
    const airPumpMachine = document.getElementById("air_pump_machine");
    const gameArea = document.getElementById("gameArea");
    const pauseButton = document.getElementById("pauseButton");
    const scoreDisplay = document.getElementById("scoreDisplay"); // Score display element
    let balloons = []; // Active balloons in the game
    let isPumping = false; // Flag to avoid rapid pumping actions
    let gamePaused = false; // Flag for game pause/resume state
    let pausedBalloonStates = []; // Store balloon states when game is paused
    let score = 0; // Score variable to keep track of points

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
        balloon.style.left = "102.8rem";
        balloon.style.bottom = "10%";
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

        // Balloon data object with random score
        const balloonData = {
            element: balloon,
            alphabetImage: alphabetImage,
            size: 60,
            clickCount: 0,
            isFloating: false,
            isPopped: false, // New flag
            dx: -45 + Math.random() * 20 - 10, // Random horizontal velocity
            dy: -62 + Math.random() * 10 - 5,  // Random vertical velocity
            score: Math.floor(Math.random() * (600 - 100 + 1)) + 100 // Random score
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

    // The rest of the code for pump action, balloon inflation, and other logic remains unchanged



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

   // Inflate the balloon by increasing its size upwards
function inflateBalloon(balloonData) {
    const balloon = balloonData.element;
    balloonData.clickCount++;
    balloonData.size += 20; // Increase balloon size with each pump

    const balloonWidth = balloonData.size * 1.2;
    const balloonHeight = balloonData.size * 1.2; 
    balloon.style.width = `${balloonWidth}px`;
    balloon.style.height = `${balloonHeight}px`;
    
    
    // Change balloon's position and scale to inflate upwards
    balloon.style.transform = `translateX(-50%) translateY(${-(balloonHeight - balloonData.size) / 2}px) scale(1)`;

    // Make the balloon fly once fully inflated
    if (balloonData.clickCount >= maxInflation && !balloonData.isFloating) {
        makeBalloonFly(balloonData);
    }
}

// Position the balloon near the nozzle ready for inflation (adjusted for upward inflation)


    // Start making the balloon fly once it is inflated
    function makeBalloonFly(balloonData) {
        balloonData.isFloating = true;
        const balloon = balloonData.element;

        // Update the position of the balloon on each frame
        function updatePosition() {
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

    // Variables to control speed
let pumpInterval = 180; // Initial interval in milliseconds
let pumpingSpeed = 200; // Initial pumping animation duration in milliseconds

// Function to dynamically adjust game speed
function adjustGameSpeed() {
    if (score >= 10000) {
        const milestone = Math.floor(score / 10000);
        pumpInterval = Math.max(50, 180 - milestone * 20); // Decrease interval to a minimum of 50ms
        pumpingSpeed = Math.max(100, 200 - milestone * 10); // Decrease pumping animation duration to a minimum of 100ms

        // Clear and restart the pump action interval with the new speed
        clearInterval(pumpActionInterval);
        pumpActionInterval = setInterval(pumpAction, pumpInterval);
    }
}

// Update the pump action logic with dynamic animation timing
function pumpAction() {
    if (gamePaused || isPumping) return;

    isPumping = true;

    pumpHandle.classList.add("pumping");
    airPumpMachine.classList.add("pumping");
    airNuzzle.classList.add("pumping");

    // Adjust pumping animation duration dynamically
    setTimeout(() => {
        if (balloons.length === 0 || balloons.every(b => b.isFloating || !isBalloonVisible(b))) {
            createBalloon();
        }

        const currentBalloon = balloons.find(b => !b.isFloating && isBalloonVisible(b));
        if (currentBalloon) {
            positionBalloonAtNozzle(currentBalloon);
            inflateBalloon(currentBalloon);
        }
    }, pumpingSpeed / 2);

    setTimeout(() => {
        pumpHandle.classList.remove("pumping");
        airPumpMachine.classList.remove("pumping");
        airNuzzle.classList.remove("pumping");
        isPumping = false;
    }, pumpingSpeed);

    // Adjust the game speed based on score
    adjustGameSpeed();
}

// Start the initial pump action interval
let pumpActionInterval = setInterval(pumpAction, pumpInterval);

// Ensure adjustGameSpeed is called whenever the score changes
function triggerBlast(balloonData) {
    if (!balloonData.isFloating || balloonData.isPopped || gamePaused) return;

    balloonData.isPopped = true;

    const balloon = balloonData.element;
    const rect = balloon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pointDisplay = document.createElement("div");
    pointDisplay.classList.add('+', "point-display");
    pointDisplay.textContent = '+' + balloonData.score;
    pointDisplay.style.position = "absolute";
    pointDisplay.style.left = `${centerX - 20}px`;
    pointDisplay.style.top = `${centerY - 20}px`;
    pointDisplay.style.fontSize = "20px";
    pointDisplay.style.color = "rgb";
    pointDisplay.style.fontWeight = "bold";
    pointDisplay.style.transition = "all 1s ease-out";
    pointDisplay.style.opacity = "0";

    gameArea.appendChild(pointDisplay);

    setTimeout(() => {
        pointDisplay.style.opacity = "1";
        pointDisplay.style.transform = "translateY(-30px)";
    }, 0);

    setTimeout(() => {
        pointDisplay.remove();
    }, 1000);

    createRealisticParticles(centerX, centerY, 3);

    balloon.classList.add("balloon-blast");
    const popSound = document.getElementById("popSound");
    if (popSound) {
        popSound.currentTime = 0;
        popSound.play();
    }

    score += balloonData.score;
    scoreDisplay.innerText = `Score: ${score}`;

    // Adjust game speed after updating score
    adjustGameSpeed();

    setTimeout(() => {
        removeBalloon(balloonData);
    }, 300);
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
            pauseButton.innerHTML = "Pause";
        } else {
            pauseGame();
            pauseButton.innerHTML = "Resume";
        }
    });

    // Start the pump action interval
    setInterval(pumpAction, 180);

   
// Function to adjust elements based on display size
function adjustElements() {
    const width = window.innerWidth;
    // Get references to the necessary DOM elements
    const airPumpMachine = document.getElementById("air_pump_machine");
    const pumpHandle = document.getElementById("pump_handle");
    const airNuzzle = document.getElementById("air_nuzzle");

    if (width < 768) {
        // For smaller screens (mobile)
        airPumpMachine.style.left = "75rem";
        airPumpMachine.style.top = "85rem";
        airPumpMachine.style.width = "auto";

        pumpHandle.style.left = "77rem";
        pumpHandle.style.top = "80rem";
        pumpHandle.style.width = "60px";

        airNuzzle.style.left = "70%";
        airNuzzle.style.top = "85%";
        airNuzzle.style.width = "auto";
    } else if (width < 1024) {
        // For medium-sized screens (tablet)
        airPumpMachine.style.left = "80%";
        airPumpMachine.style.top = "75%";
        airPumpMachine.style.width = "auto";

        pumpHandle.style.left = "82%";
        pumpHandle.style.top = "70%";
        pumpHandle.style.width = "70px";

        airNuzzle.style.left = "75%";
        airNuzzle.style.top = "75%";
        airNuzzle.style.width = "auto";
    } else {
        // For larger screens (desktop)
        airPumpMachine.style.left = "107rem";
        airPumpMachine.style.top = "45rem";
        airPumpMachine.style.width = "auto";

        pumpHandle.style.left = "106rem";
        pumpHandle.style.top = "37rem";
        pumpHandle.style.width = "auto";

        airNuzzle.style.left = "99.3rem";  // Adjust as needed for large screens
        airNuzzle.style.top = "43rem";     // Adjust as needed for large screens
        airNuzzle.style.width = "auto";
    }

    
}

// Function to position the balloon at the nozzle dynamically
function positionBalloonAtNozzle(balloonData) {
    const airNuzzle = document.getElementById("air_nuzzle");
    const balloon = balloonData.element;

    // Get the current position and dimensions of the nozzle
    const nozzleRect = airNuzzle.getBoundingClientRect();

    // Set the position of the balloon relative to the nozzle
    balloon.style.opacity = "1";
    balloon.style.position = "absolute"; // Ensure absolute positioning
    balloon.style.left = `${nozzleRect.left + nozzleRect.width / 2 -55}px`; // Center horizontally
    balloon.style.top = `${nozzleRect.top - balloon.offsetHeight/2-35}px`; // Position directly above the nozzle

    // Set the initial balloon scale to 0 for inflation effect
    balloon.style.transform = "translateX(0) translateY(20) scale(0)";
}


// Adjust balloon position when the screen size changes
window.addEventListener("load", adjustElements);
window.addEventListener("resize", adjustElements);

  function checkOrientation() {
    const gameArea = document.getElementById("gameArea");
    const orientationMessage = document.getElementById("orientationMessage");

    if (window.innerWidth > window.innerHeight) {
        // Landscape mode
        gameArea.style.display = "block";
        orientationMessage.style.display = "none";
    } else {
        // Portrait mode
        gameArea.style.display = "none";
        orientationMessage.style.display = "flex"; // Center the message
    }
}

// Run the check on load and resize
window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);

});