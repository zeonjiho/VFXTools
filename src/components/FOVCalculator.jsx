import React, { useState } from 'react';
import { commonFocalLengths, focalLengthLabels } from '../utils/cameraUtils';
import FOVVisualizer from './FOVVisualizer';
import styles from './FOVCalculator.module.css';

/**
 * Component for lens focal length selection and field of view calculation
 * @param {Object} props
 * @param {Object} props.sensorData - Sensor data
 */
const FOVCalculator = ({ sensorData }) => {
  const [focalLength, setFocalLength] = useState(50);
  const [customFocalLength, setCustomFocalLength] = useState('');
  const [distance, setDistance] = useState(10);
  
  const handleFocalLengthChange = (e) => {
    setFocalLength(Number(e.target.value));
  };
  
  const handleCustomFocalLengthChange = (e) => {
    setCustomFocalLength(e.target.value);
  };
  
  const handleCustomFocalLengthSubmit = () => {
    const value = parseFloat(customFocalLength);
    if (!isNaN(value) && value > 0) {
      setFocalLength(value);
      setCustomFocalLength('');
    }
  };
  
  const handleDistanceChange = (e) => {
    setDistance(Number(e.target.value));
  };
  
  // Extract sensor width and height
  const sensorWidth = sensorData?.mm?.width || 0;
  const sensorHeight = sensorData?.mm?.height || 0;
  
  const getFocalLengthLabel = (fl) => {
    // Find the closest representative focal length label
    const threshold = 5;
    const representativeFocalLengths = Object.keys(focalLengthLabels).map(Number);
    
    for (const repFL of representativeFocalLengths) {
      if (Math.abs(fl - repFL) <= threshold) {
        return focalLengthLabels[repFL];
      }
    }
    
    // General classification
    if (fl < 24) return 'Ultra Wide';
    if (fl < 35) return 'Wide';
    if (fl < 50) return 'Semi Wide';
    if (fl < 85) return 'Standard';
    if (fl < 135) return 'Medium Tele';
    if (fl < 300) return 'Tele';
    return 'Super Tele';
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.sliderGroup}>
          <div className={styles.sliderHeader}>
            <label htmlFor="focalLength">Focal Length (mm)</label>
            <span className={styles.focalLengthDisplay}>
              {focalLength} mm
              <span className={styles.focalLengthLabel}>{getFocalLengthLabel(focalLength)}</span>
            </span>
          </div>
          <input
            type="range"
            id="focalLength"
            className={styles.slider}
            min="8"
            max="200"
            step="1"
            value={focalLength}
            onChange={handleFocalLengthChange}
          />
          
          <div className={styles.presetButtons}>
            {commonFocalLengths.filter(fl => fl <= 200).map(fl => (
              <button
                key={fl}
                className={`${styles.presetButton} ${focalLength === fl ? styles.selected : ''}`}
                onClick={() => setFocalLength(fl)}
              >
                {fl}
              </button>
            ))}
          </div>
          
          <div className={styles.customInput}>
            <input
              type="text"
              className={styles.customFocalLength}
              placeholder="Custom input"
              value={customFocalLength}
              onChange={handleCustomFocalLengthChange}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomFocalLengthSubmit()}
            />
            <button 
              className={styles.customFocalLengthButton}
              onClick={handleCustomFocalLengthSubmit}
              disabled={!customFocalLength}
            >
              Apply
            </button>
          </div>
        </div>
        
        <div className={styles.sliderGroup}>
          <div className={styles.sliderHeader}>
            <label htmlFor="distance">Subject Distance (m)</label>
            <span>{distance} m</span>
          </div>
          <input
            type="range"
            id="distance"
            className={styles.slider}
            min="1"
            max="50"
            step="1"
            value={distance}
            onChange={handleDistanceChange}
          />
          
          <div className={styles.presetButtons}>
            {[1, 2, 5, 10, 20, 50].map(d => (
              <button
                key={d}
                className={`${styles.presetButton} ${distance === d ? styles.selected : ''}`}
                onClick={() => setDistance(d)}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 3D Field of View Visualization */}
      <div className={styles.visualizerContainer}>
        <FOVVisualizer
          sensorWidth={sensorWidth}
          sensorHeight={sensorHeight}
          focalLength={focalLength}
          distance={distance}
        />
      </div>
    </div>
  );
};

export default FOVCalculator; 