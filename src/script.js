import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import{ GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import{ DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
//import gsap from 'gsap'

// Loaders
const textureLoader = new THREE.TextureLoader()
const texture1 = textureLoader.load('/textures/composition_1_test.jpg')
const texture2 = textureLoader.load('/textures/composition_2_test.jpg')

/**
 * Debug
 */
const gui = new dat.GUI()
const global = {}

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')

// Global i
global.i = 0

// Material
const material = new THREE.MeshPhysicalMaterial({  
    //был 0.1
    roughness: 0.3,   
    transmission: 1,  
    thickness: 1,
    //был 0.5
    ior: 0.7,
    specularIIntensity : 10,
    clearcoat : 1,
    sheenRoughness : 1
  })


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Plane1
const geometry1 = new THREE.PlaneGeometry( 2.4, 1.923539);
const material1 = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, map: texture1} );
const plane1 = new THREE.Mesh( geometry1, material1 );
plane1.position.set(1.3, 0.05, -3)
scene.add( plane1 ); 

// Plane2
const geometry2 = new THREE.PlaneGeometry( 2.4, 2.253);
const material2 = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, map: texture2} );
const plane2 = new THREE.Mesh( geometry2, material2 );
plane2.position.set(0.8, -4, -3)
scene.add( plane2 ); 

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    //'scroll_concept_v3.glb',
    //'1.glb',
    //'shape_1_optimized.gltf',
    //'2.glb',
    '/models/thing3.glb',
    //'new_glass1.glb',
    (gltf) =>
    {
        //const children = [...gltf.scene.children]

        //for(const child of children)
        //{
        //    scene.add(child)
        //}

        const model = gltf.scene;
        model.traverse(child=>
        {
            if(child.isMesh){
                child.material = material
            }
        })

        //mixer = new THREE.AnimationMixer(gltf.scene)
        //const action = mixer.clipAction(gltf.animations[global.i])
        

        //action.play()

        model.scale.set(0.6, 0.6, 0.6) 
        //model.position.set(0.5, 0, -2)
        model.position.set(1.4, -0.1, -2)
        //gltf.scene.rotation.y = 1
        scene.add(model)

        

        //пытаюсь вращать
        

        const clock = new THREE.Clock()
        let previousTime = 0

        const tick = () =>
        {
        const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - previousTime
        previousTime = elapsedTime

        //model.rotation.x += deltaTime * 0.1
        //model.rotation.y += deltaTime * 0.12
        model.rotation.z -= deltaTime * 0.12

        ///
            // ПЫТАЮСЬ ПРИВЯЗАТЬ АНИМАЦИЮ К МЫШКЕ))
        /**
        * Mouse
        */
        let scrollY = window.scrollY
        scrollY = window.scrollY
        console.log(scrollY)

        
        window.addEventListener('mousemove', (event)=>
        {

            const parallaxX = -cursor.x * 0.1
            const parallaxY = -cursor.y * 0.1
            //model.position.x += (parallaxY - model.position.y) * 0.007 * deltaTime
            //model.position.y += (parallaxY - model.position.y) * 0.007 * deltaTime

            //model.rotation.x += (parallaxY - model.rotation.y) * 0.007 * deltaTime
            //model.rotation.y += (parallaxY - model.rotation.y) * 0.007 * deltaTime

            model.rotation.x += (parallaxY - model.rotation.y) * 0.008
            model.rotation.y += (parallaxY - model.rotation.y) * 0.008
            
        
        })
    
        

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()
        // 

        console.log('ok')

        let scrollY = window.scrollY 
        let currentSection = 0

        window.addEventListener('scroll', () =>
        {
        scrollY = window.scrollY 
        //if(model.position.x > 0.4)
        if(scrollY<600)
        {

            console.log(scrollY)

            model.position.y = -scrollY * 0.006 
            model.position.x = 1 - scrollY * 0.001 

            model.rotation.z -= scrollY * 0.0007
            model.rotation.x -= scrollY * 0.00005
            model.rotation.y -= scrollY * 0.00005

            
        }
        
        

        const newSection = Math.round(scrollY / sizes.height)

        if(newSection != currentSection)
        {
        currentSection = newSection

        global.i = 2

        //action.play()
        }
    
    //console.log(newSection)
    
        })
    }
)




/**
 * Real time environment map
 */
//const environmentMap = textureLoader.load('hp_v9_white_page-0001.jpg')
const environmentMap = textureLoader.load('/EnvironmentMaps/2.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace

scene.environment = environmentMap
//scene.background = environmentMap


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xffffff, 3)
pointLight.position.set(1.2, 0, -1)
scene.add(pointLight)

//const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
//scene.add(pointLightHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 2);
cameraGroup.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
// убрать эту строку, если надо зафиксировать позицию
//let scrollY = window.scrollY



/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    
    camera.position.y = - scrollY / sizes.height * 4
    
    const parallaxX = cursor.x * 0.5
    const parallaxY = -cursor.y * 0.5
    //cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    //cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
//
    //plane.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    //plane.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
    
    // Animate meshes
    //gltf.scene.rotation.x += deltaTime * 0.1
    //gltf.scene.rotation.y + deltaTime * 0.12
    

    // Update mixer
    if(mixer != null)
    {
        mixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()