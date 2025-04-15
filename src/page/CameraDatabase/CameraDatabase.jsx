import React, { useState, useEffect } from 'react';
import styles from './CameraDatabase.module.css';
import sensorData from '../../data/sensors.json';
import FOVVisualizer from '../../components/FOVVisualizer';
import { useSidebar } from '../../layout/AppLayout/AppLayout';

// 카메라 모델 리스트 사이드바 컴포넌트
const CameraModelSidebar = ({ 
  cameraData, 
  searchTerm,
  setSearchTerm,
  brands, 
  selectedBrand, 
  onBrandSelect,
  expandedLines, 
  expandedModels,
  selectedCamera, 
  selectedMode,
  toggleLine, 
  toggleModel,
  handleModeSelect,
  organizedCameras
}) => {
  return (
    <div className={styles.sidebarContent}>
      {/* 검색창 */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search camera model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 브랜드 버튼 */}
      <div className={styles.brandButtons}>
        {brands.length === 0 ? (
          <div className={styles.noResults}>No results found</div>
        ) : (
          brands.map(brand => (
            <button
              key={brand}
              className={`${styles.brandButton} ${selectedBrand === brand ? styles.selected : ''}`}
              onClick={() => onBrandSelect(brand)}
            >
              {brand}
            </button>
          ))
        )}
      </div>
      
      {/* 선택된 브랜드의 카메라 모델 목록 */}
      {selectedBrand && (
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
  );
};

// 센서 정보 컴포넌트
const SensorInfoSection = ({ sensorData, selectedCamera, selectedMode }) => {
  if (!sensorData) {
    return (
      <div className={styles.emptySection}>
        <p>Select a camera to view sensor information</p>
      </div>
    );
  }
  
  return (
    <div className={styles.sensorInfoSection}>
      <h2 className={styles.sectionTitle}>Sensor Information</h2>
      
      <div className={styles.cameraHeader}>
        <h3>{selectedCamera.brand} {selectedCamera.model}</h3>
        <div className={styles.modeDisplay}>Resolution: {selectedMode}</div>
      </div>
      
      <div className={styles.sensorGrid}>
        <div className={styles.sensorItem}>
          <h4>Resolution</h4>
          {sensorData.resolution &&
            sensorData.resolution.width && (
              <p>
                {sensorData.resolution.width} × {sensorData.resolution.height}
              </p>
            )}
        </div>
        
        <div className={styles.sensorItem}>
          <h4>Sensor Size (mm)</h4>
          <p>Width: {sensorData.mm.width}</p>
          <p>Height: {sensorData.mm.height}</p>
          <p>Diagonal: {sensorData.mm.diagonal}</p>
        </div>
        
        <div className={styles.sensorItem}>
          <h4>Sensor Size (inches)</h4>
          <p>Width: {sensorData.inches.width}"</p>
          <p>Height: {sensorData.inches.height}"</p>
          <p>Diagonal: {sensorData.inches.diagonal}"</p>
        </div>
      </div>
    </div>
  );
};

// FOV 제어 컴포넌트
const FOVControlSection = ({ focalLength, setFocalLength, distance, setDistance }) => {
  if (!focalLength || !setFocalLength || !distance || !setDistance) {
    return (
      <div className={styles.emptySection}>
        <p>Select a camera to control FOV</p>
      </div>
    );
  }
  
  return (
    <div className={styles.fovControlSection}>
      <h2 className={styles.sectionTitle}>FOV Control</h2>
      
      <div className={styles.controlsGrid}>
        {/* Focal Length Control */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <label>Focal Length (mm)</label>
            <span>{focalLength} mm</span>
          </div>
          
          <input
            type="range"
            min="12"
            max="300"
            value={focalLength}
            onChange={(e) => setFocalLength(Number(e.target.value))}
            className={styles.slider}
          />
          
          <div className={styles.presetButtons}>
            {[12, 18, 24, 35, 50, 85, 135, 200].map(fl => (
              <button
                key={fl}
                className={`${styles.presetButton} ${focalLength === fl ? styles.selected : ''}`}
                onClick={() => setFocalLength(fl)}
              >
                {fl}mm
              </button>
            ))}
          </div>
        </div>
        
        {/* Distance Control */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <label>Subject Distance (m)</label>
            <span>{distance} m</span>
          </div>
          
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className={styles.slider}
          />
          
          <div className={styles.presetButtons}>
            {[1, 2, 3, 5, 10, 15].map(dist => (
              <button
                key={dist}
                className={`${styles.presetButton} ${distance === dist ? styles.selected : ''}`}
                onClick={() => setDistance(dist)}
              >
                {dist}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// FOV 시각화 컴포넌트
const FOVVisualizerSection = ({ sensorWidth, sensorHeight, focalLength, distance }) => {
  if (!sensorWidth || !sensorHeight) {
    return (
      <div className={styles.emptySection}>
        <p>Select a camera to view FOV visualization</p>
      </div>
    );
  }
  
  return (
    <div className={styles.fovVisualizerSection}>
      <FOVVisualizer 
        sensorWidth={sensorWidth}
        sensorHeight={sensorHeight}
        focalLength={focalLength}
        distance={distance}
      />
    </div>
  );
};

// 메인 컴포넌트
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
  const [focalLength, setFocalLength] = useState(50);
  const [subjectDistance, setSubjectDistance] = useState(3);
  
  // 사이드바 컨텍스트 사용
  const { setRightSidebarContent, setRightSidebarVisible, setRightSidebarTitle } = useSidebar();

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

  useEffect(() => {
    try {
      setCameraData(sensorData);
      if (Object.keys(sensorData).length > 0) {
        setSelectedBrand(Object.keys(sensorData)[0]);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load data.");
      setLoading(false);
    }
  }, []);

  // 사이드바에 카메라 목록 컴포넌트 설정
  useEffect(() => {
    if (cameraData) {
      // 현재 선택된 브랜드에 대한 정리된 카메라 데이터 계산
      const currentOrganizedCameras = selectedBrand ? organizedCameras(cameraData, selectedBrand, searchTerm) : {};
      
      const sidebarContent = (
        <CameraModelSidebar
          cameraData={cameraData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          brands={filteredBrands}
          selectedBrand={selectedBrand}
          onBrandSelect={handleBrandSelect}
          expandedLines={expandedLines}
          expandedModels={expandedModels}
          selectedCamera={selectedCamera}
          selectedMode={selectedMode}
          toggleLine={toggleLine}
          toggleModel={toggleModel}
          handleModeSelect={handleModeSelect}
          organizedCameras={currentOrganizedCameras}
        />
      );
      
      setRightSidebarContent(sidebarContent);
      setRightSidebarTitle('카메라 모델');
      setRightSidebarVisible(true);
    }
    
    // 컴포넌트 언마운트시 사이드바 닫기
    return () => {
      setRightSidebarVisible(false);
    };
  }, [cameraData, searchTerm, selectedBrand, expandedLines, expandedModels, selectedCamera, selectedMode, filteredBrands]);

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

  // Filter and group camera models by line for selected brand
  const organizedCameras = (cameraData, selectedBrand, searchTerm) => {
    if (selectedBrand && cameraData && cameraData[selectedBrand]) {
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
    }
    return {};
  };

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
      <div className={styles.grid}>
        {/* 센서 정보 섹션 */}
        <div className={styles.sensorInfo}>
          <SensorInfoSection 
            sensorData={currentSensorData}
            selectedCamera={selectedCamera}
            selectedMode={selectedMode}
          />
        </div>
        
        {/* FOV 제어 섹션 */}
        <div className={styles.fovControls}>
          <FOVControlSection 
            focalLength={focalLength}
            setFocalLength={setFocalLength}
            distance={subjectDistance}
            setDistance={setSubjectDistance}
          />
        </div>
        
        {/* FOV 시각화 섹션 */}
        <div className={styles.fovVisualizer}>
          <FOVVisualizerSection 
            sensorWidth={currentSensorData?.mm.width}
            sensorHeight={currentSensorData?.mm.height}
            focalLength={focalLength}
            distance={subjectDistance}
          />
        </div>
      </div>
    </div>
  );
};

export default CameraDatabase;
