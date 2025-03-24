import React from 'react';
import styles from '../../page/FilenameGenerator/FilenameGenerator.module.css';
import { 
  COLORSPACE_OPTIONS, 
  PRODUCT_TYPE_OPTIONS, 
  VERSION_STATE_OPTIONS,
  OPTIONAL_FIELDS 
} from '../../constants/filenameGenerator';

const FormFields = ({
  formFields,
  checkboxStates,
  showCheckboxes,
  onInputChange,
  onCheckboxChange,
  onVersionStateChange
}) => {
  return (
    <>
      {/* Project Name */}
      <div className={styles.inputGroup}>
        <label htmlFor="projectName">Project Name</label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          placeholder="Enter project name"
          value={formFields.projectName}
          onChange={onInputChange}
          pattern="[A-Za-z0-9_()* ]+"
          title="영어, 숫자 및 특수문자 (_, *, ())만 입력 가능합니다."
        />
      </div>
      
      {/* Product */}
      <div className={styles.inputGroup}>
        <label htmlFor="product">Product</label>
        <input
          type="text"
          id="product"
          name="product"
          placeholder="Enter product name"
          value={formFields.product}
          onChange={onInputChange}
          pattern="[A-Za-z0-9_()* ]+"
          title="영어, 숫자 및 특수문자 (_, *, ())만 입력 가능합니다."
        />
      </div>
      
      {/* Cut Name */}
      <div className={styles.inputGroup}>
        <label htmlFor="cutName">Cut Name</label>
        <input
          type="text"
          id="cutName"
          name="cutName"
          placeholder="Enter cut name"
          value={formFields.cutName}
          onChange={onInputChange}
          pattern="[A-Za-z0-9_()* ]+"
          title="영어, 숫자 및 특수문자 (_, *, ())만 입력 가능합니다."
        />
      </div>
      
      {/* Color Space */}
      {checkboxStates.includeColorspace && (
        <div className={styles.inputGroup}>
          <label htmlFor="colorspace">Color Space</label>
          <select
            id="colorspace"
            name="colorspace"
            value={formFields.colorspace}
            onChange={onInputChange}
          >
            {COLORSPACE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Resolution */}
      {checkboxStates.includeResolution && (
        <div className={styles.inputGroup}>
          <label htmlFor="xResolution">Resolution</label>
          <div className={styles.resolutionInputs}>
            <input
              type="number"
              id="xResolution"
              name="xResolution"
              placeholder="Width (x)"
              min="0"
              value={formFields.xResolution}
              onChange={onInputChange}
            />
            <span>x</span>
            <input
              type="number"
              id="yResolution"
              name="yResolution"
              placeholder="Height (y)"
              min="0"
              value={formFields.yResolution}
              onChange={onInputChange}
            />
          </div>
        </div>
      )}
      
      {/* Product Type */}
      {checkboxStates.includeProductType && (
        <div className={styles.inputGroup}>
          <label htmlFor="productType">Product Type</label>
          <select
            id="productType"
            name="productType"
            value={formFields.productType}
            onChange={onInputChange}
          >
            {PRODUCT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Founder */}
      {checkboxStates.includeFounder && (
        <div className={styles.inputGroup}>
          <label htmlFor="founder">Founder</label>
          <input
            type="text"
            id="founder"
            name="founder"
            placeholder="Enter founder's name"
            value={formFields.founder}
            onChange={onInputChange}
            pattern="[A-Za-z ]+"
            title="영어만 입력 가능합니다."
          />
        </div>
      )}
      
      {/* Version State */}
      {checkboxStates.includeVersionState && (
        <div className={styles.inputGroup}>
          <label htmlFor="versionState">Version State</label>
          <select
            id="versionState"
            name="versionState"
            value={formFields.versionState}
            onChange={onVersionStateChange}
          >
            {VERSION_STATE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Version */}
      {checkboxStates.includeVersion && (
        <div className={styles.inputGroup}>
          <label htmlFor="version">Version</label>
          <input
            type="number"
            id="version"
            name="version"
            placeholder="Enter version number"
            min="1"
            value={formFields.version}
            onChange={onInputChange}
          />
        </div>
      )}
      
      {/* Frame Number */}
      {checkboxStates.includeFrameNumber && (
        <div className={styles.inputGroup}>
          <label htmlFor="frameNumberLength">Frame Number Length</label>
          <input
            type="number"
            id="frameNumberLength"
            name="frameNumberLength"
            min="4"
            value={formFields.frameNumberLength}
            onChange={onInputChange}
          />
        </div>
      )}
    </>
  );
};

export default FormFields; 