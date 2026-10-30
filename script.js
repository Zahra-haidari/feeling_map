
// ======================================
// FEELMAP - 3D EMOTIONAL WEATHER MAP
// ======================================

const globeElement = document.getElementById("globe");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    globeElement.clientWidth / globeElement.clientHeight,
    0.1,
    100
);

camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(
    globeElement.clientWidth,
    globeElement.clientHeight
);

globeElement.appendChild(renderer.domElement);

// ======================================
// ORBIT CONTROLS
// ======================================

const controls = new THREE.OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.enableZoom = true;
controls.minDistance = 2.5;
controls.maxDistance = 7;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.45;

// ======================================
// LIGHTING
// ======================================

scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const mainLight = new THREE.PointLight(0xaaaaff, 2);
mainLight.position.set(5, 3, 5);
scene.add(mainLight);

const purpleLight = new THREE.PointLight(0x8755ff, 2);
purpleLight.position.set(-4, -2, 3);
scene.add(purpleLight);

// ======================================
// EARTH
// ======================================

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    function(texture) {
        earth.material.map = texture;
        earth.material.needsUpdate = true;
    },
    undefined,
    function() {
        console.log("Earth texture could not load.");
    }
);

const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x9aaaff,
    shininess: 25,
    specular: 0x333366
});

const earth = new THREE.Mesh(
    earthGeometry,
    earthMaterial
);

earthGroup.add(earth);

// ======================================
// EARTH ATMOSPHERE
// ======================================

const atmosphereGeometry = new THREE.SphereGeometry(
    1.57,
    64,
    64
);

const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x8b65ff,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
});

const atmosphere = new THREE.Mesh(
    atmosphereGeometry,
    atmosphereMaterial
);

earthGroup.add(atmosphere);

// ======================================
// STARS BACKGROUND
// ======================================

const starGeometry = new THREE.BufferGeometry();

const starPositions = [];

for (let i = 0; i < 1800; i++) {

    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;

    starPositions.push(x, y, z);
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(
    starGeometry,
    starMaterial
);

scene.add(stars);

// ======================================
// MOOD CONFIGURATION
// ======================================

const moods = {

    Happy: {
        emoji: "😊",
        color: 0xffd166
    },

    Sad: {
        emoji: "🌧️",
        color: 0x65aaff
    },

    Calm: {
        emoji: "🌿",
        color: 0x5be0b4
    },

    Anxious: {
        emoji: "🫧",
        color: 0xb18aff
    },

    Loved: {
        emoji: "💗",
        color: 0xff70b5
    },

    Hopeful: {
        emoji: "🌅",
        color: 0xff9566
    }

};

let selectedMood = "Happy";
let placingMood = false;

let moodMarkers = [];

let moodCounts = {
    Happy: 4745,
    Sad: 2121,
    Calm: 2746,
    Anxious: 1400,
    Loved: 1474,
    Hopeful: 0
};

let totalMoods = 12486;

// ======================================
// LATITUDE AND LONGITUDE
// ======================================

function getPosition(lat, lon, radius = 1.53) {

    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// ======================================
// CREATE MOOD MARKER
// ======================================

function createMoodMarker(lat, lon, mood) {

    const position = getPosition(lat, lon);

    const color = moods[mood].color;

    const markerGroup = new THREE.Group();

    markerGroup.position.copy(position);

    const direction = position.clone().normalize();

    markerGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        direction
    );

    // Glowing central point

    const dotGeometry = new THREE.SphereGeometry(
        0.035,
        16,
        16
    );

    const dotMaterial = new THREE.MeshBasicMaterial({
        color: color
    });

    const dot = new THREE.Mesh(
        dotGeometry,
        dotMaterial
    );

    markerGroup.add(dot);

    // Pulsing ring

    const ringGeometry = new THREE.TorusGeometry(
        0.09,
        0.009,
        8,
        32
    );

    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
    });

    const ring = new THREE.Mesh(
        ringGeometry,
        ringMaterial
    );

    markerGroup.add(ring);

    markerGroup.userData = {
        ring: ring,
        dot: dot,
        phase: Math.random() * Math.PI * 2,
        mood: mood
    };

    earthGroup.add(markerGroup);

    moodMarkers.push(markerGroup);

    return markerGroup;
}

// ======================================
// INITIAL GLOBAL MOODS
// ======================================

const initialLocations = [

    [35.6, 139.6, "Happy"],
    [40.7, -74.0, "Loved"],
    [51.5, -0.1, "Calm"],
    [48.8, 2.3, "Hopeful"],
    [28.6, 77.2, "Sad"],
    [-33.8, 151.2, "Happy"],
    [30.0, 31.2, "Calm"],
    [23.8, 90.4, "Hopeful"],
    [19.0, 72.8, "Loved"],
    [55.7, 37.6, "Anxious"],
    [-23.5, -46.6, "Happy"],
    [37.5, 127.0, "Sad"],
    [41.0, 28.9, "Loved"],
    [25.2, 55.2, "Hopeful"],
    [60.1, 24.9, "Calm"],
    [39.9, 116.4, "Happy"],
    [-1.2, 36.8, "Hopeful"],
    [43.6, -79.3, "Anxious"],
    [13.0, 80.2, "Calm"],
    [52.5, 13.4, "Loved"]

];

initialLocations.forEach(location => {

    createMoodMarker(
        location[0],
        location[1],
        location[2]
    );

});

// ======================================
// MOOD SELECTION
// ======================================

const moodButtons = document.querySelectorAll(".mood-btn");

moodButtons.forEach(button => {

    button.addEventListener("click", () => {

        moodButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedMood = button.dataset.mood;

        document.getElementById("selected-emoji").textContent =
            moods[selectedMood].emoji;

        document.getElementById("selected-text").textContent =
            selectedMood + " selected";

        document.getElementById("shareHint").textContent =
            "Now click anywhere on the globe to place your feeling.";

        placingMood = false;

    });

});

// ======================================
// SHARE BUTTON
// ======================================

document.getElementById("shareBtn").addEventListener(
    "click",
    () => {

        placingMood = true;

        document.getElementById("shareHint").textContent =
            "Your mood is ready! Click a location on Earth.";

        showToast("Choose a place on Earth to share your feeling 🌍");

    }
);

// ======================================
// RAYCASTING - CLICK ON EARTH
// ======================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let pointerDown = null;

renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        pointerDown = {
            x: event.clientX,
            y: event.clientY
        };

    }
);

renderer.domElement.addEventListener(
    "pointerup",
    event => {

        if (!pointerDown) return;

        const distance = Math.hypot(
            event.clientX - pointerDown.x,
            event.clientY - pointerDown.y
        );

        pointerDown = null;

        // Ignore globe dragging

        if (distance > 6) return;

        if (!placingMood) return;

        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        mouse.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(earth);

        if (intersects.length > 0) {

            const point = intersects[0].point;

            // Convert the clicked point to world coordinates

            const worldPoint = earth.localToWorld(
                point.clone()
            );

            // Convert to Earth local coordinates

            earthGroup.worldToLocal(worldPoint);

            const radius = worldPoint.length();

            const lat = 90 -
                Math.acos(worldPoint.y / radius) * 180 / Math.PI;

            const lon =
                Math.atan2(worldPoint.z, -worldPoint.x) *
                180 / Math.PI;

            createMoodMarker(lat, lon, selectedMood);

            moodCounts[selectedMood]++;
            totalMoods++;

            updateStatistics();

            addActivity(
                selectedMood,
                "Somewhere on Earth"
            );

            placingMood = false;

            document.getElementById("shareHint").textContent =
                "Your feeling is now part of the map. Thank you!";

            showToast(
                moods[selectedMood].emoji +
                " Your feeling has been placed on Earth!"
            );

        }

    }
);

// ======================================
// STATISTICS
// ======================================

function updateStatistics() {

    document.getElementById("totalMoods").textContent =
        totalMoods.toLocaleString();

    const visibleMoods = ["Happy", "Sad", "Calm", "Loved"];

    const sum = visibleMoods.reduce(
        (total, mood) => total + moodCounts[mood],
        0
    );

    const ids = {
        Happy: "happy",
        Sad: "sad",
        Calm: "calm",
        Loved: "loved"
    };

    visibleMoods.forEach(mood => {

        const percentage = Math.round(
            moodCounts[mood] / sum * 100
        );

        const id = ids[mood];

        document.getElementById(id + "Percent").textContent =
            percentage + "%";

        document.getElementById(id + "Bar").style.width =
            percentage + "%";

    });

}

// ======================================
// ACTIVITY FEED
// ======================================

const cities = [

    "Tokyo, Japan",
    "New York, USA",
    "London, UK",
    "Dhaka, Bangladesh",
    "Kabul, Afghanistan",
    "Paris, France",
    "Sydney, Australia",
    "Toronto, Canada",
    "Dubai, UAE",
    "Seoul, South Korea",
    "Copenhagen, Denmark",
    "Mumbai, India"

];

function addActivity(mood, location) {

    const feed = document.getElementById("activityFeed");

    const item = document.createElement("div");

    item.className = "activity-item";

    const messages = {
        Happy: "Someone is feeling happy",
        Sad: "Someone is having a difficult day",
        Calm: "Someone found their calm",
        Anxious: "Someone is feeling anxious",
        Loved: "Someone is feeling loved",
        Hopeful: "Someone is feeling hopeful"
    };

    const emoji = moods[mood].emoji;

    item.innerHTML = `
        <span class="activity-emoji">${emoji}</span>

        <div>
            <strong>${messages[mood]}</strong>
            <p>Somewhere in ${location}</p>
        </div>

        <span class="time">Just now</span>
    `;

    feed.prepend(item);

    // Keep only the latest 6 activities

    while (feed.children.length > 6) {
        feed.removeChild(feed.lastElementChild);
    }

}

// ======================================
// SIMULATED LIVE GLOBAL ACTIVITY
// ======================================

function generateRandomMood() {

    const moodNames = Object.keys(moods);

    const randomMood = moodNames[
        Math.floor(Math.random() * moodNames.length)
    ];

    const randomLat = Math.random() * 140 - 70;
    const randomLon = Math.random() * 360 - 180;

    const randomCity = cities[
        Math.floor(Math.random() * cities.length)
    ];

    createMoodMarker(
        randomLat,
        randomLon,
        randomMood
    );

    moodCounts[randomMood]++;
    totalMoods++;

    updateStatistics();

    addActivity(randomMood, randomCity);

}

// New simulated mood every 5 seconds

setInterval(generateRandomMood, 5000);

// ======================================
// TOAST NOTIFICATION
// ======================================

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}

// ======================================
// ABOUT BUTTON
// ======================================

function showAbout() {

    alert(
        "FEELMAP 🌍\n\n" +
        "A map of feelings.\n\n" +
        "A place where people from all over the world " +
        "can share their emotions and discover the " +
        "emotional weather of humanity.\n\n" +
        "Every feeling matters. ❤️"
    );

}

// ======================================
// ANIMATION LOOP
// ======================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth globe movement

    controls.update();

    // Animate all mood markers

    moodMarkers.forEach(marker => {

        const data = marker.userData;

        const pulse = Math.sin(
            elapsed * 3 + data.phase
        );

        const scale = 1 + (pulse + 1) * 0.35;

        data.ring.scale.set(
            scale,
            scale,
            scale
        );

        data.ring.material.opacity =
            0.35 + (pulse + 1) * 0.3;

    });

    // Subtle star movement

    stars.rotation.y += 0.00008;

    renderer.render(scene, camera);

}

// ======================================
// RESPONSIVE RESIZING
// ======================================

window.addEventListener("resize", () => {

    const width = globeElement.clientWidth;
    const height = globeElement.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

});

// START WEBSITE

updateStatistics();

animate();
