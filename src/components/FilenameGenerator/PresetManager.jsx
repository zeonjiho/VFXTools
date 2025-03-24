import React from 'react';
import styles from '../../page/FilenameGenerator/FilenameGenerator.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';

const PresetManager = ({
  showExportDialog,
  exportFileName,
  onExportFileNameChange,
  onExport,
  onCancelExport,
  onImport,
  fileInputRef
}) => {
  return (
    <>
      <div className={styles.presetManager}>
        <div className={styles.presetControls}>
          <button onClick={onExport}>
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
          <button onClick={() => fileInputRef.current.click()}>
            <FontAwesomeIcon icon={faUpload} /> Import
          </button>
          <input
            type="file"
            id="importInput"
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={onImport}
          />
        </div>
      </div>
      
      {showExportDialog && (
        <div className={styles.exportDialog}>
          <div className={styles.dialogContent}>
            <h3>Save Preset File</h3>
            <input
              type="text"
              id="presetFileName"
              placeholder="Enter to File Name"
              value={exportFileName}
              onChange={(e) => onExportFileNameChange(e.target.value)}
            />
            <div className={styles.dialogButtons}>
              <button id="confirmExport" onClick={onExport}>Export</button>
              <button id="cancelExport" onClick={onCancelExport}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PresetManager; 