import React, { useState, useEffect } from 'react';
import styles from './CameraDatabase.module.css';
import sensorData from '../../data/sensors.json';
import FOVCalculator from '../../components/FOVCalculator';

const CameraDatabase = () => {
  const [cameraData, setCameraData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [expandedLines, setExpandedLines] = useState({});
  const [expandedModels, setExpandedModels] = useState({});
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'fov'

  useEffect(() => {
    try {
      setCameraData(sensorData);
      // Select first brand as default (if data exists)
      if (Object.keys(sensorData).length > 0) {
        setSelectedBrand(Object.keys(sensorData)[0]);
      }
      setLoading(false);
    } catch (err) {
      setError("Error loading data.");
      setLoading(false);
    }
  }, []);

  // Brand selection function
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedCamera(null);
    setSelectedMode(null);
  };

  // Camera line toggle function
  const toggleLine = (brand, line) => {
    const key = `${brand}-${line}`;
    setExpandedLines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Camera model toggle function
  const toggleModel = (brand, model) => {
    const key = `${brand}-${model}`;
    setExpandedModels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    // Select camera info when model is selected
    handleCameraSelect(brand, model);
  };

  // Get filtered brands based on search
  const filteredBrands = cameraData 
    ? Object.keys(cameraData).filter(brand => {
        if (brand.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // Check if any model under the brand matches the search term
        const models = cameraData[brand];
        return Object.keys(models).some(model => 
          model.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Filter and group camera models by line for selected brand
  const organizedCameras = selectedBrand && cameraData && cameraData[selectedBrand]
    ? (() => {
        const models = cameraData[selectedBrand];
        
        // Filter if search term exists
        const filteredModels = searchTerm
          ? Object.keys(models).reduce((acc, model) => {
              if (model.toLowerCase().includes(searchTerm.toLowerCase())) {
                acc[model] = models[model];
              }
              return acc;
            }, {})
          : models;
          
        return groupModelsByLine(filteredModels);
      })()
    : {};

  // Function to group camera models by line
  function groupModelsByLine(models) {
    const lines = {};
    
    Object.entries(models).forEach(([model, data]) => {
      // Extract line from model name (e.g., "ALEXA Mini" → "ALEXA")
      const lineName = extractLineName(model);
      
      if (!lines[lineName]) {
        lines[lineName] = {};
      }
      
      lines[lineName][model] = data;
    });
    
    return lines;
  }

  // Extract line name from model name (simple implementation)
  function extractLineName(model) {
    // Consider everything before space or number as line
    const match = model.match(/^([a-zA-Z]+)/);
    if (match) {
      return match[0];
    }
    
    // If line cannot be extracted, classify as 'Other'
    return 'Other';
  }

  const handleCameraSelect = (brand, model) => {
    setSelectedCamera({ brand, model });
    
    // Automatically select first mode of the model
    if (cameraData[brand][model]["sensor dimensions"]) {
      const modes = Object.keys(cameraData[brand][model]["sensor dimensions"]);
      if (modes.length > 0) {
        setSelectedMode(modes[0]);
      }
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  if (loading) return <div className={styles.loading}>Loading data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!cameraData) return <div className={styles.error}>Camera data not found.</div>;

  // Get current sensor data
  const getCurrentSensorData = () => {
    if (selectedCamera && selectedMode && 
        cameraData[selectedCamera.brand] && 
        cameraData[selectedCamera.brand][selectedCamera.model] &&
        cameraData[selectedCamera.brand][selectedCamera.model]["sensor dimensions"] &&
        cameraData[selectedCamera.brand][selectedCamera.model]["sensor dimensions"][selectedMode]) {
      return cameraData[selectedCamera.brand][selectedCamera.model]["sensor dimensions"][selectedMode];
    }
    return null;
  };
  
  const currentSensorData = getCurrentSensorData();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Camera Sensor Database</h1>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by camera brand or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Brand buttons section */}
      <div className={styles.brandButtons}>
        {filteredBrands.length === 0 ? (
          <div className={styles.noResults}>No results found.</div>
        ) : (
          filteredBrands.map(brand => (
            <button
              key={brand}
              className={`${styles.brandButton} ${selectedBrand === brand ? styles.selected : ''}`}
              onClick={() => handleBrandSelect(brand)}
            >
              {brand}
            </button>
          ))
        )}
      </div>

      <div className={styles.content}>
        {/* Left section: Camera line, model and mode selection */}
        <div className={styles.cameraList}>
          {selectedBrand && Object.keys(organizedCameras).length === 0 ? (
            <div className={styles.noResults}>No results found.</div>
          ) : selectedBrand && (
            <div className={styles.selectedBrandContent}>
              <h2 className={styles.selectedBrandTitle}>{selectedBrand}</h2>
              
              {/* Camera lines and models */}
              {Object.entries(organizedCameras).map(([line, models]) => (
                <div key={`${selectedBrand}-${line}`} className={styles.lineSection}>
                  <div 
                    className={styles.lineHeader}
                    onClick={() => toggleLine(selectedBrand, line)}
                  >
                    <h3 className={styles.lineTitle}>{line}</h3>
                    <span className={`${styles.arrow} ${expandedLines[`${selectedBrand}-${line}`] ? styles.expanded : ''}`}>
                      &#9660;
                    </span>
                  </div>
                  
                  {expandedLines[`${selectedBrand}-${line}`] && (
                    <div className={styles.modelList}>
                      {Object.keys(models).map((model) => (
                        <div key={model} className={styles.modelSection}>
                          <div
                            className={`${styles.cameraItem} ${
                              selectedCamera?.brand === selectedBrand && selectedCamera?.model === model
                                ? styles.selected
                                : ''
                            }`}
                            onClick={() => toggleModel(selectedBrand, model)}
                          >
                            {model}
                          </div>
                          
                          {/* Mode list for selected model */}
                          {selectedCamera?.brand === selectedBrand && 
                           selectedCamera?.model === model && 
                           cameraData[selectedBrand][model]["sensor dimensions"] && (
                            <div className={styles.modesListInMenu}>
                              <p className={styles.modesTitle}>Select Resolution:</p>
                              {Object.keys(cameraData[selectedBrand][model]["sensor dimensions"]).map((mode) => (
                                <div
                                  key={mode}
                                  className={`${styles.modeItemInMenu} ${
                                    selectedMode === mode ? styles.selected : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModeSelect(mode);
                                  }}
                                >
                                  {mode}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right section: Sensor info and FOV calculator */}
        <div className={styles.details}>
          {selectedCamera && selectedMode && currentSensorData ? (
            <>
              <h2 className={styles.detailsTitle}>
                {selectedCamera.brand} {selectedCamera.model} - {selectedMode}
              </h2>
              
              {/* Tab menu */}
              <div className={styles.tabMenu}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'info' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Sensor Info
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'fov' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('fov')}
                >
                  FOV Calculator
                </button>
              </div>
              
              {/* Tab content */}
              <div className={styles.tabContent}>
                {/* Sensor info tab */}
                {activeTab === 'info' && (
                  <div className={styles.sensorDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <h4>Resolution</h4>
                        {currentSensorData.resolution &&
                          currentSensorData.resolution.width && (
                            <p>
                              {currentSensorData.resolution.width} x{' '}
                              {currentSensorData.resolution.height}
                            </p>
                          )}
                      </div>
                      <div className={styles.detailItem}>
                        <h4>Sensor Size (mm)</h4>
                        <p>Width: {currentSensorData.mm.width}</p>
                        <p>Height: {currentSensorData.mm.height}</p>
                        <p>Diagonal: {currentSensorData.mm.diagonal}</p>
                      </div>
                      <div className={styles.detailItem}>
                        <h4>Sensor Size (inches)</h4>
                        <p>Width: {currentSensorData.inches.width}"</p>
                        <p>Height: {currentSensorData.inches.height}"</p>
                        <p>Diagonal: {currentSensorData.inches.diagonal}"</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* FOV calculator tab */}
                {activeTab === 'fov' && (
                  <div className={styles.fovCalculator}>
                    {currentSensorData && <FOVCalculator sensorData={currentSensorData} />}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyDetails}>
              <div className={styles.emptyDetailsContent}>
                <h2>Camera Sensor Information</h2>
                <p>Select a camera and resolution from the left to view sensor information here.</p>
                <div className={styles.cameraIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">
                    <path fill="rgba(255,255,255,0.2)" d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraDatabase;
