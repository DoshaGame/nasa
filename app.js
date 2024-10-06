// Elements
const startButton = document.getElementById('startButton');
const container = document.getElementById('container');

// Event listener to start the experience
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    container.style.display = 'block';
    init();  // Initialize 3D scene
});

let scene, camera, renderer, controls;
let sun, planets = [];

// Updated planet data with realistic scales
const planetData = [
    {
        name: 'Mercury',
        texture: 'textures/mercury.jpg',
        radius: 0.38,  // уменьшенный масштаб радиуса
        distance: 39,   // уменьшенное расстояние от Солнца
        speed: 6.21,
        description: 'Mercury is the smallest planet in our solar system and the closest to the Sun.'
    },
    {
        name: 'Venus',
        texture: 'textures/venus.jpg',
        radius: 0.95,  // уменьшенный масштаб радиуса
        distance: 79,  // уменьшенное расстояние от Солнца
        speed: 2.44,
        description: 'Venus is the second planet from the Sun and is similar in structure to Earth.'
    },
    {
        name: 'Earth',
        texture: 'textures/earth.jpg',
        radius: 1,  // базовый радиус
        distance: 100,  // уменьшенное расстояние от Солнца
        speed: 1.5,
        satellites: [
            {
                name: 'Moon',
                texture: 'textures/moon.jpg',
                radius: 0.27,
                distance: 1.5
            }
        ],
        spaceObjects: [
            {
                name: 'Hubble Space Telescope',
                texture: 'textures/hubble.jpg',
                distance: 2
            }
        ],
        description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.'
    },
    {
        name: 'Mars',
        texture: 'textures/mars.jpg',
        radius: 0.53,  // уменьшенный масштаб радиуса
        distance: 152,  // уменьшенное расстояние от Солнца
        speed: 0.80,
        satellites: [
            {
                name: 'Phobos',
                texture: 'textures/phobos.jpg',
                radius: 0.14,
                distance: 1
            },
            {
                name: 'Deimos',
                texture: 'textures/deimos.jpg',
                radius: 0.08,
                distance: 1.5
            }
        ],
        description: 'Mars is the fourth planet from the Sun and is known for its red color.'
    },
    {
        name: 'Jupiter',
        texture: 'textures/jupiter.jpg',
        radius: 11.2,  // уменьшенный масштаб радиуса
        distance: 520,  // уменьшенное расстояние от Солнца
        speed: 0.25,
        description: 'Jupiter is the largest planet in our solar system, known for its Great Red Spot.'
    },
    {
        name: 'Saturn',
        texture: 'textures/saturn.jpg',
        radius: 9.5,  // уменьшенный масштаб радиуса
        distance: 958,  // уменьшенное расстояние от Солнца
        speed: 0.05,
        description: 'Saturn is famous for its stunning rings and is the second largest planet in the solar system.'
    },
    {
        name: 'Uranus',
        texture: 'textures/uranus.jpg',
        radius: 4.0,  // уменьшенный масштаб радиуса
        distance: 1400,  // уменьшенное расстояние от Солнца
        speed: 0.017,
        description: 'Uranus is the third largest planet in our solar system and has a unique blue color.'
    },
    {
        name: 'Neptune',
        texture: 'textures/neptune.jpg',
        radius: 3.9,  // уменьшенный масштаб радиуса
        distance: 1800,  // уменьшенное расстояние от Солнца
        speed: 0.009,
        description: 'Neptune is known for its deep blue color and is the farthest planet from the Sun.'
    }
];

// Function for asynchronously loading textures
function loadTextureAsync(texturePath) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            texturePath,
            (texture) => resolve(texture),
            undefined,
            (error) => reject(error)
        );
    });
}

async function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load texture for the star background
    const starTexture = new THREE.TextureLoader().load('textures/stars.jpg');  // Убедитесь, что текстура звёзд существует
    const starGeometry = new THREE.SphereGeometry(5000, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
    const stars = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(stars);

    // Sun with texture
    const sunTexture = new THREE.TextureLoader().load('textures/sun.jpg');
    const sunGeometry = new THREE.SphereGeometry(15, 32, 32); // Установлен радиус Солнца
    const sunMaterial = new THREE.MeshStandardMaterial({ map: sunTexture });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const numLights = 12; // Увеличиваем количество источников света
    const lightDistance = 500; // Расстояние от центра Солнца

    const lightPositions = [
        { x: lightDistance, y: 0, z: 0 },
        { x: -lightDistance, y: 0, z: 0 },
        { x: 0, y: lightDistance, z: 0 },
        { x: 0, y: -lightDistance, z: 0 },
        { x: 0, y: 0, z: lightDistance },
        { x: 0, y: 0, z: -lightDistance },
        { x: lightDistance * Math.cos(Math.PI / 4), y: lightDistance * Math.sin(Math.PI / 4), z: 0 },
        { x: lightDistance * Math.cos(-Math.PI / 4), y: lightDistance * Math.sin(-Math.PI / 4), z: 0 },
        { x: lightDistance * Math.cos(Math.PI / 3), y: lightDistance * Math.sin(Math.PI / 3), z: 0 },
        { x: lightDistance * Math.cos(-Math.PI / 3), y: lightDistance * Math.sin(-Math.PI / 3), z: 0 },
        { x: 0, y: lightDistance * Math.cos(Math.PI / 6), z: lightDistance * Math.sin(Math.PI / 6) },
        { x: 0, y: lightDistance * Math.cos(-Math.PI / 6), z: lightDistance * Math.sin(-Math.PI / 6) }
    ];

    // Добавляем источники света
    lightPositions.forEach(pos => {
        const pointLight = new THREE.PointLight(0xffffff, 1, 1000); // Увеличенная дальность
        pointLight.position.set(
            sun.position.x + pos.x, 
            sun.position.y + pos.y, 
            sun.position.z + pos.z + 15 // Радиус Солнца
        );
        scene.add(pointLight);
    });

    // Planets with async texture loading and adjusted distances and sizes
    for (const data of planetData) {
        try {
            const planetTexture = await loadTextureAsync(data.texture);
            const planetGeometry = new THREE.SphereGeometry(data.radius, 64, 64);  // Adjusted size
            const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.position.set(data.distance, 0, 0);
            planet.userData = {
                name: data.name,
                speed: data.speed,
                distance: data.distance,
                satellites: data.satellites || [],
                spaceObjects: data.spaceObjects || [],
                description: data.description,
                tilt: data.tilt || 0
            };

            planets.push(planet);
            scene.add(planet);
        } catch (error) {
            console.error(`Error loading texture for ${data.name}:`, error);
        }
    }

    camera.position.z = 100;  // Adjusted to view larger distances

    animate();

    // Resize handling
    window.addEventListener('resize', onWindowResize, false);
}

// Resize function
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate Sun
    //sun.rotation.y += 0.002;

    // Rotate planets
    planets.forEach(planet => {
        planet.rotation.y += 0.01;
        planet.position.x = planet.userData.distance * Math.cos(Date.now() * 0.0001 * planet.userData.speed);
        planet.position.z = planet.userData.distance * Math.sin(Date.now() * 0.0001 * planet.userData.speed);
    });

    controls.update();
    renderer.render(scene, camera);
}
