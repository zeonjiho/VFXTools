import React from 'react';
import styles from '../../page/FilenameGenerator/FilenameGenerator.module.css';
import { getPresetTooltip } from '../../utils/presetUtils';

const PresetButtons = ({ 
  currentProject,
  currentPresetNumber, 
  totalPresets, 
  onPresetClick, 
  onAddPreset, 
  onRemovePreset,
  presetMessage 
}) => {
  const renderPresetButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPresets; i++) {
      buttons.push(
        <button
          key={i}
          className={`${styles.presetButton} ${currentPresetNumber === i ? styles.selectedPreset : ''}`}
          onClick={() => onPresetClick(i)}
          data-tooltip={getPresetTooltip(currentProject, i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className={styles.presetButtons}>
      <div className={styles.presetsContainer}>
        {renderPresetButtons()}
      </div>
      <div className={styles.addRemoveButtons}>
        <button className={styles.addRemoveButton} onClick={onAddPreset}>+</button>
        <button className={styles.addRemoveButton} onClick={onRemovePreset}>-</button>
      </div>
      {presetMessage.visible && (
        <div 
          className={`${styles.presetMessage} ${presetMessage.isPositive ? styles.positive : styles.negative}`}
        >
          {presetMessage.text}
        </div>
      )}
    </div>
  );
};

export default PresetButtons; 