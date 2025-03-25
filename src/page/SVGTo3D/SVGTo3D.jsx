import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faCog, faRedo, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './SVGTo3D.module.css';
import { useSidebar } from '../../layout/AppLayout/AppLayout';

// Sidebar settings component
const SidebarSettings = ({ extrusionSettings, handleSettingChange, exportModel }) => {
  return (
    <div className={styles.sidebarContent}>
      {/* 3D settings area */}
      <div className={styles.settingsSection}>
        <h3>3D Settings</h3>
        <div className={styles.settingsControls}>
          <div className={styles.settingItem}>
            <label>Depth</label>
            <div className={styles.rangeContainer}>
              <input
                type="range"
                name="depth"
                min="1"
                max="50"
                value={extrusionSettings.depth}
                onChange={handleSettingChange}
              />
              <div className={styles.rangeValue}>{extrusionSettings.depth}</div>
            </div>
          </div>
          
          <div className={styles.settingItem}>
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="bevelEnabled"
                checked={extrusionSettings.bevelEnabled}
                onChange={handleSettingChange}
              />
              <label>Enable Bevel</label>
            </div>
          </div>
          
          {extrusionSettings.bevelEnabled && (
            <>
              <div className={styles.settingItem}>
                <label>Bevel Thickness</label>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    name="bevelThickness"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={extrusionSettings.bevelThickness}
                    onChange={handleSettingChange}
                  />
                  <div className={styles.rangeValue}>{extrusionSettings.bevelThickness}</div>
                </div>
              </div>
              
              <div className={styles.settingItem}>
                <label>Bevel Size</label>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    name="bevelSize"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={extrusionSettings.bevelSize}
                    onChange={handleSettingChange}
                  />
                  <div className={styles.rangeValue}>{extrusionSettings.bevelSize}</div>
                </div>
              </div>
              
              <div className={styles.settingItem}>
                <label>Bevel Segments</label>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    name="bevelSegments"
                    min="1"
                    max="10"
                    value={extrusionSettings.bevelSegments}
                    onChange={handleSettingChange}
                  />
                  <div className={styles.rangeValue}>{extrusionSettings.bevelSegments}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Export button */}
      <button className={styles.exportButton} onClick={exportModel}>
        <FontAwesomeIcon icon={faDownload} /> Export 3D Model (GLB)
      </button>
    </div>
  );
};

// 3D model component
const SVGModel = ({ svgData, extrusionSettings }) => {
  const groupRef = useRef();
  
  useEffect(() => {
    if (!svgData) return;
    
    const loader = new SVGLoader();
    const paths = loader.parse(svgData).paths;
    
    // Clear previous meshes
    if (groupRef.current) {
      while(groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
    }
    
    // Process SVG paths
    paths.forEach((path) => {
      const material = new THREE.MeshPhongMaterial({
        color: path.color ? new THREE.Color(path.color) : new THREE.Color(0x00ff00),
        side: THREE.DoubleSide,
        flatShading: true,
      });
      
      // Create shapes
      const shapes = SVGLoader.createShapes(path);
      
      shapes.forEach((shape) => {
        // Create extrusion geometry
        const geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
        const mesh = new THREE.Mesh(geometry, material);
        groupRef.current.add(mesh);
      });
    });
    
    // Center model
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    groupRef.current.position.x = -center.x;
    groupRef.current.position.y = -center.y;
    groupRef.current.position.z = -center.z;
    
  }, [svgData, extrusionSettings]);
  
  return <group ref={groupRef} />;
};

const SVGTo3D = () => {
  const [svgData, setSvgData] = useState(null);
  const [svgText, setSvgText] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState({ visible: false, text: '', type: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [extrusionSettings, setExtrusionSettings] = useState({
    depth: 10,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 3
  });
  
  const fileInputRef = useRef(null);
  const notificationTimerRef = useRef(null);
  
  // Using sidebar context
  const { setRightSidebarContent, setRightSidebarVisible, setRightSidebarTitle, rightSidebarVisible } = useSidebar();
  
  // Set up sidebar on component mount
  useEffect(() => {
    const sidebarContent = (
      <SidebarSettings 
        extrusionSettings={extrusionSettings} 
        handleSettingChange={handleSettingChange}
        exportModel={exportModel}
      />
    );
    
    setRightSidebarContent(sidebarContent);
    setRightSidebarTitle('SVG 3D Settings');
    setRightSidebarVisible(true);
    
    return () => {
      // Reset sidebar on component unmount
      setRightSidebarVisible(false);
      setRightSidebarContent(null);
    };
  }, [extrusionSettings]); // Update sidebar content when extrusion settings change
  
  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.svg')) {
      showNotification('Only SVG files can be uploaded.', 'error');
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const svgText = event.target.result;
      setSvgText(svgText);
      setSvgData(svgText);
      setIsProcessing(false);
      showNotification('SVG file loaded successfully.', 'success');
    };
    
    reader.onerror = () => {
      setIsProcessing(false);
      showNotification('An error occurred while reading the file.', 'error');
    };
    
    reader.readAsText(file);
  };
  
  // SVG text input handler
  const handleSVGTextChange = (e) => {
    setSvgText(e.target.value);
  };
  
  // Apply SVG text
  const applySVGText = () => {
    if (!svgText.trim()) {
      showNotification('Please enter SVG code.', 'error');
      return;
    }
    
    if (!svgText.includes('<svg')) {
      showNotification('Please enter valid SVG code.', 'error');
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setSvgData(svgText);
      setIsProcessing(false);
      showNotification('SVG code applied.', 'success');
    }, 500);
  };
  
  // Extrusion settings change handler
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExtrusionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };
  
  // Show notification
  const showNotification = (text, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({ text, type, visible: true });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // Export model (simple example)
  const exportModel = () => {
    showNotification('Model export feature is in development.', 'info');
    // Actual implementation would capture the scene and export as GLB
  };
  
  // Load example SVG
  const loadExample = () => {
    const exampleSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="#00ff00" />
        <circle cx="50" cy="50" r="20" fill="#ff0000" />
      </svg>
    `;
    
    setSvgText(exampleSVG);
    setSvgData(exampleSVG);
    setFileName('example.svg');
    showNotification('Example SVG loaded.', 'success');
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SVG to 3D Converter</h1>
      <div className={styles.subtitle}>Convert SVG files to 3D models, visualize and export them</div>
      
      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          {/* File upload area */}
          <div className={styles.uploadSection}>
            <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
              <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
              <p>Click to upload an SVG file or drag and drop</p>
              {fileName && <div className={styles.fileName}>{fileName}</div>}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".svg"
                className={styles.fileInput}
              />
            </div>
          </div>
          
          {/* Direct SVG code input area */}
          <div className={styles.codeInputSection}>
            <div className={styles.sectionHeader}>
              <h3>Enter SVG Code</h3>
              <button className={styles.applyButton} onClick={applySVGText}>
                <FontAwesomeIcon icon={faCheck} /> Apply
              </button>
            </div>
            <textarea 
              className={styles.codeInput}
              value={svgText}
              onChange={handleSVGTextChange}
              placeholder="Paste your SVG code here"
            />
            <div className={styles.codeActions}>
              <button className={styles.loadExampleButton} onClick={loadExample}>
                Load Example
              </button>
            </div>
          </div>
        </div>
        
        <div className={`${styles.rightSection} ${rightSidebarVisible ? styles.withSidebar : ''}`}>
          {/* 3D preview area */}
          <div className={styles.previewContainer}>
            {isProcessing ? (
              <div className={styles.loadingSpinner}>Processing...</div>
            ) : svgData ? (
              <div className={styles.canvasWrapper}>
                <Canvas
                  shadows
                  camera={{ position: [0, 0, 100], fov: 50 }}
                  resize={{ scroll: false }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%'
                  }}
                  gl={{ preserveDrawingBuffer: true }}
                  linear
                >
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                  />
                  <Stage environment="city" intensity={0.6}>
                    <SVGModel svgData={svgData} extrusionSettings={extrusionSettings} />
                  </Stage>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                  <pointLight position={[-10, -10, -10]} />
                </Canvas>
              </div>
            ) : (
              <div className={styles.emptyPreview}>
                <p>Upload an SVG file or enter SVG code to see the 3D preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification.visible && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.text}
        </div>
      )}
    </div>
  );
};

export default SVGTo3D; 