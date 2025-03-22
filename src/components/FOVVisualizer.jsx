import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { calculateHorizontalFOV, calculateVerticalFOV, calculateFrustumVertices, createFrustumLines } from '../utils/cameraUtils';
import styles from './FOVVisualizer.module.css';

/**
 * Component for 3D visualization of lens Field of View (FOV)
 * @param {Object} props
 * @param {number} props.sensorWidth - Sensor width (mm)
 * @param {number} props.sensorHeight - Sensor height (mm)
 * @param {number} props.focalLength - Lens focal length (mm)
 * @param {number} props.distance - Distance to subject (m, default 10)
 */
const FOVVisualizer = ({ sensorWidth, sensorHeight, focalLength, distance = 10 }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const frustumRef = useRef(null);
  const gridHelperRef = useRef(null);
  const initialCameraPositionRef = useRef(null);
  const initialControlsTargetRef = useRef(null);

  const [horizontalFOV, setHorizontalFOV] = useState(0);
  const [verticalFOV, setVerticalFOV] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x111111);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 2, 5);
    initialCameraPositionRef.current = camera.position.clone();

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Enable panning with middle mouse button
    controls.enablePan = true;
    controls.panSpeed = 1.2; // Increase panning speed
    
    // Mouse button settings: explicitly set middle button to PAN
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    };
    
    // Other mouse-related settings
    controls.screenSpacePanning = true; // Adjust panning direction based on camera orientation
    
    initialControlsTargetRef.current = controls.target.clone();

    // Detect control changes to determine reset button visibility
    controls.addEventListener('change', () => {
      const cameraMoved = !camera.position.equals(initialCameraPositionRef.current);
      const targetMoved = !controls.target.equals(initialControlsTargetRef.current);
      
      setShowResetButton(cameraMoved || targetMoved);
    });

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Create frustum object
    const frustumObject = new THREE.Group();
    frustumRef.current = frustumObject;
    scene.add(frustumObject);

    // Add camera representation
    const cameraRepresentation = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x007bff, wireframe: true })
    );
    cameraRepresentation.position.set(0, 0, 0);
    scene.add(cameraRepresentation);

    // Animation loop and resize handler
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    // Enable panning with arrow keys
    const handleKeyDown = (event) => {
      const panSpeed = 0.1;
      
      switch(event.key) {
        case 'ArrowUp':
          controls.pan(0, panSpeed * 10);
          break;
        case 'ArrowDown':
          controls.pan(0, -panSpeed * 10);
          break;
        case 'ArrowLeft':
          controls.pan(panSpeed * 10, 0);
          break;
        case 'ArrowRight':
          controls.pan(-panSpeed * 10, 0);
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Redraw frustum when FOV updates
  useEffect(() => {
    if (!sensorWidth || !sensorHeight || !focalLength || !sceneRef.current || !frustumRef.current) return;

    // Clear existing frustum objects
    while (frustumRef.current.children.length > 0) {
      frustumRef.current.remove(frustumRef.current.children[0]);
    }

    // Calculate FOV
    const hFOV = calculateHorizontalFOV(sensorWidth, focalLength);
    const vFOV = calculateVerticalFOV(sensorHeight, focalLength);
    
    setHorizontalFOV(hFOV);
    setVerticalFOV(vFOV);

    // Calculate frustum vertices
    const nearPlane = 0.5;
    const farPlane = distance;
    const vertices = calculateFrustumVertices(hFOV, vFOV, nearPlane, farPlane);
    const lines = createFrustumLines(vertices);

    // Create wireframe lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    lines.forEach(([start, end]) => {
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setFromPoints([new THREE.Vector3(...start), new THREE.Vector3(...end)]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      frustumRef.current.add(line);
    });

    // Create frustum faces (semi-transparent)
    const createFace = (v1, v2, v3, v4) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [
        new THREE.Vector3(...v1),
        new THREE.Vector3(...v2),
        new THREE.Vector3(...v3),
        new THREE.Vector3(...v1),
        new THREE.Vector3(...v3),
        new THREE.Vector3(...v4)
      ];
      geometry.setFromPoints(vertices);
      
      // Setup for normal calculation
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      
      return new THREE.Mesh(geometry, material);
    };

    // Create 4 side faces and front/back faces of frustum
    const faces = [
      // Front face (Near Plane)
      createFace(vertices.nearTopLeft, vertices.nearTopRight, vertices.nearBottomRight, vertices.nearBottomLeft),
      // Back face (Far Plane)
      createFace(vertices.farTopLeft, vertices.farTopRight, vertices.farBottomRight, vertices.farBottomLeft),
      // Right face
      createFace(vertices.nearTopRight, vertices.farTopRight, vertices.farBottomRight, vertices.nearBottomRight),
      // Left face
      createFace(vertices.nearTopLeft, vertices.farTopLeft, vertices.farBottomLeft, vertices.nearBottomLeft),
      // Top face
      createFace(vertices.nearTopLeft, vertices.nearTopRight, vertices.farTopRight, vertices.farTopLeft),
      // Bottom face
      createFace(vertices.nearBottomLeft, vertices.nearBottomRight, vertices.farBottomRight, vertices.farBottomLeft)
    ];

    faces.forEach(face => frustumRef.current.add(face));

    // Add subject plane (at distance)
    const planeGeometry = new THREE.PlaneGeometry(
      calculateFieldWidth(distance, hFOV),
      calculateFieldHeight(distance, vFOV)
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const subjectPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    subjectPlane.position.set(0, 0, -distance);
    frustumRef.current.add(subjectPlane);

  }, [sensorWidth, sensorHeight, focalLength, distance]);

  function calculateFieldWidth(distance, horizontalFOV) {
    const fovRadians = (horizontalFOV * Math.PI) / 180;
    return 2 * distance * Math.tan(fovRadians / 2);
  }
  
  function calculateFieldHeight(distance, verticalFOV) {
    const fovRadians = (verticalFOV * Math.PI) / 180;
    return 2 * distance * Math.tan(fovRadians / 2);
  }

  const handleResetView = () => {
    if (!cameraRef.current || !controlsRef.current || 
        !initialCameraPositionRef.current || !initialControlsTargetRef.current) return;
    
    // Smoothly animate camera position and control target back to initial values
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const initialPosition = initialCameraPositionRef.current;
    const initialTarget = initialControlsTargetRef.current;
    
    // Animation settings
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1000; // Animation duration (1 second)
    const startTime = Date.now();
    
    const animateReset = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      // Apply easing function (smooth movement)
      const easeProgress = cubicEaseInOut(progress);
      
      // Interpolate camera position
      camera.position.lerpVectors(startPosition, initialPosition, easeProgress);
      // Interpolate control target
      controls.target.lerpVectors(startTarget, initialTarget, easeProgress);
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      } else {
        setShowResetButton(false);
      }
    };
    
    animateReset();
  };

  // Easing function for smooth animation
  function cubicEaseInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  return (
    <div className={styles.container}>
      <div className={styles.visualizer} ref={containerRef}>
        {showResetButton && (
          <button 
            className={styles.resetViewButton} 
            onClick={handleResetView}
            title="Reset View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
        )}
        <div className={styles.panInstructions}>
          <div className={styles.instructionIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <span>Wheel click + drag to pan</span>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span>Horizontal FOV:</span>
          <span>{horizontalFOV.toFixed(1)}°</span>
        </div>
        <div className={styles.infoItem}>
          <span>Vertical FOV:</span>
          <span>{verticalFOV.toFixed(1)}°</span>
        </div>
        <div className={styles.infoItem}>
          <span>Focal Length:</span>
          <span>{focalLength} mm</span>
        </div>
        <div className={styles.infoItem}>
          <span>Field at {distance}m:</span>
          <span>{calculateFieldWidth(distance, horizontalFOV).toFixed(2)} x {calculateFieldHeight(distance, verticalFOV).toFixed(2)}m</span>
        </div>
      </div>
    </div>
  );
};

export default FOVVisualizer; 