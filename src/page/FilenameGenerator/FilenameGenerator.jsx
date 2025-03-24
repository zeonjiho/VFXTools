import React, { useState, useEffect, useRef } from 'react';
import styles from './FilenameGenerator.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faSave, faRedo, faTrash, faCog, faBell, faCheckCircle, faExclamationCircle, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

import ProjectManager from '../../components/FilenameGenerator/ProjectManager';
import PresetButtons from '../../components/FilenameGenerator/PresetButtons';
import FormFields from '../../components/FilenameGenerator/FormFields';
import PresetManager from '../../components/FilenameGenerator/PresetManager';

import { 
  MAX_PRESETS, 
  DEFAULT_FORM_FIELDS, 
  DEFAULT_CHECKBOX_STATES,
  OPTIONAL_FIELDS 
} from '../../constants/filenameGenerator';
import { 
  savePreset, 
  loadPreset, 
  exportPresets, 
  importPresets,
  getProjects,
  saveProject,
  deleteProject
} from '../../utils/presetUtils';
import { generateFilename } from '../../utils/filenameUtils';

const FilenameGenerator = () => {
  // 상태 관리
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState('');
  const [currentPresetNumber, setCurrentPresetNumber] = useState(1);
  const [totalPresets, setTotalPresets] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [formFields, setFormFields] = useState(DEFAULT_FORM_FIELDS);
  const [checkboxStates, setCheckboxStates] = useState(DEFAULT_CHECKBOX_STATES);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  
  // 통합 알림 시스템
  const [notification, setNotification] = useState({ text: '', type: 'success', visible: false });
  
  // 레거시 알림 (나중에 제거될 예정)
  const [presetMessage, setPresetMessage] = useState({ text: '', isPositive: true, visible: false });
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  
  const fileInputRef = useRef(null);
  
  // 알림 타이머 관리를 위한 ref
  const notificationTimerRef = useRef(null);

  // 초기화
  useEffect(() => {
    // 프로젝트 목록 가져오기
    const existingProjects = getProjects();
    
    // 기본 프로젝트 설정
    if (existingProjects.length === 0) {
      const defaultProjects = saveProject('기본 프로젝트');
      setProjects(defaultProjects);
      setCurrentProject('기본 프로젝트');
    } else {
      setProjects(existingProjects);
      setCurrentProject(existingProjects[0]);
    }
  }, []);

  // 현재 프로젝트가 변경되면 해당 프로젝트의 프리셋 개수를 가져옴
  useEffect(() => {
    if (currentProject) {
      const storedTotalPresets = localStorage.getItem(`project_${currentProject}_totalPresets`);
      if (storedTotalPresets) {
        setTotalPresets(parseInt(storedTotalPresets));
      } else {
        localStorage.setItem(`project_${currentProject}_totalPresets`, '1');
        setTotalPresets(1);
      }

      // 현재 프로젝트의 첫 번째 프리셋 로드
      setCurrentPresetNumber(1);
      handleLoadPreset(1);
    }
  }, [currentProject]);

  // 통합 알림 표시 함수
  const showNotification = (text, type = 'success') => {
    // 이전 타이머가 있으면 제거
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({ text, type, visible: true });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
      notificationTimerRef.current = null;
    }, 5000);
  };

  // 메시지 표시 함수 - 호환성 유지
  const displayPresetMessage = (text, isPositive) => {
    setPresetMessage({ text, isPositive, visible: true });
    showNotification(text, isPositive ? 'success' : 'error');
    setTimeout(() => {
      setPresetMessage(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // 프로젝트 추가
  const handleAddProject = (projectName) => {
    const updatedProjects = saveProject(projectName);
    setProjects(updatedProjects);
    setCurrentProject(projectName);
    showNotification(`새 프로젝트 "${projectName}"이(가) 생성되었습니다.`, 'success');
  };

  // 프로젝트 삭제
  const handleDeleteProject = (projectName) => {
    const updatedProjects = deleteProject(projectName);
    setProjects(updatedProjects);
    
    if (currentProject === projectName) {
      setCurrentProject(updatedProjects[0] || '');
    }
    
    showNotification(`프로젝트 "${projectName}"이(가) 삭제되었습니다.`, 'error');
  };

  // 프로젝트 선택
  const handleSelectProject = (projectName) => {
    if (isDirty) {
      if (!window.confirm('저장되지 않은 변경 사항이 있습니다. 정말로 프로젝트를 전환하시겠습니까?')) {
        return;
      }
    }
    
    setCurrentProject(projectName);
    showNotification(`프로젝트 "${projectName}"로 전환했습니다.`, 'success');
  };

  // 프리셋 추가
  const addPreset = () => {
    if (totalPresets < MAX_PRESETS) {
      const newTotalPresets = totalPresets + 1;
      setTotalPresets(newTotalPresets);

      // 현재 프리셋의 데이터를 새로운 프리셋에 복사
      const currentData = {
        ...formFields,
        checkboxStates
      };

      savePreset(currentProject, newTotalPresets, formFields, checkboxStates);
      showNotification(`새 프리셋 ${newTotalPresets}이(가) 추가되었습니다.`, 'success');
    } else {
      showNotification('더 이상 프리셋을 추가할 수 없습니다.', 'error');
      alert('더 이상 프리셋을 추가할 수 없습니다.');
    }
  };

  // 프리셋 제거
  const removePreset = () => {
    if (totalPresets > 1) {
      const presetData = localStorage.getItem(`project_${currentProject}_preset${totalPresets}`);
      let hasData = false;
      
      if (presetData) {
        const parsedData = JSON.parse(presetData);
        const projectName = parsedData.projectName?.trim();
        const product = parsedData.product?.trim();
        const cutName = parsedData.cut_name?.trim();

        if (projectName || product || cutName) {
          hasData = true;
        }
      }

      if (hasData) {
        if (window.confirm(`프리셋 ${totalPresets}에 데이터가 있습니다. 정말로 삭제하시겠습니까?`)) {
          localStorage.removeItem(`project_${currentProject}_preset${totalPresets}`);
        } else {
          return;
        }
      } else {
        localStorage.removeItem(`project_${currentProject}_preset${totalPresets}`);
      }

      if (currentPresetNumber === totalPresets) {
        setCurrentPresetNumber(1);
        handleLoadPreset(1);
      }
      
      setTotalPresets(totalPresets - 1);
      localStorage.setItem(`project_${currentProject}_totalPresets`, (totalPresets - 1).toString());
      
      showNotification(`프리셋 ${totalPresets}이(가) 삭제되었습니다.`, 'error');
    } else {
      showNotification('최소 하나의 프리셋은 있어야 합니다.', 'error');
      alert('최소 하나의 프리셋은 있어야 합니다.');
    }
  };

  // 현재 프리셋 저장
  const saveCurrentToPreset = () => {
    const { projectName, product, cutName } = formFields;

    // 필드 검증
    if (!projectName.trim() || !product.trim() || !cutName.trim()) {
      showNotification('저장할 데이터가 없습니다.', 'error');
      return;
    }

    savePreset(currentProject, currentPresetNumber, formFields, checkboxStates);
    showNotification(`프리셋 ${currentPresetNumber}이(가) 저장되었습니다.`, 'success');
    setIsDirty(false);
  };

  // 프리셋 로드
  const handleLoadPreset = (presetNumber) => {
    if (isDirty) {
      if (!window.confirm('저장되지 않은 변경 사항이 있습니다. 정말로 프리셋을 전환하시겠습니까?')) {
        return;
      }
    }

    setCurrentPresetNumber(presetNumber);
    const { formFields: loadedFields, checkboxStates: loadedCheckboxes } = loadPreset(currentProject, presetNumber);
    
    setFormFields(loadedFields);
    setCheckboxStates(loadedCheckboxes);
    showNotification(`프리셋 ${presetNumber}이(가) 로드되었습니다.`, 'success');
    setIsDirty(false);
  };

  // 현재 프리셋 초기화
  const resetCurrentPreset = () => {
    if (window.confirm('현재 프리셋의 모든 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem(`project_${currentProject}_preset${currentPresetNumber}`);
      showNotification(`프리셋 ${currentPresetNumber}이(가) 초기화되었습니다.`, 'error');
      
      setFormFields(DEFAULT_FORM_FIELDS);
      setCheckboxStates(DEFAULT_CHECKBOX_STATES);
      setIsDirty(false);
    }
  };

  // 현재 프로젝트의 모든 데이터 초기화
  const resetProjectData = () => {
    if (window.confirm(`현재 프로젝트 "${currentProject}"의 모든 프리셋 데이터를 삭제하시겠습니까?`)) {
      // 프로젝트의 모든 프리셋 삭제
      for (let i = 1; i <= totalPresets; i++) {
        localStorage.removeItem(`project_${currentProject}_preset${i}`);
      }
      
      // 프리셋 개수 초기화
      localStorage.setItem(`project_${currentProject}_totalPresets`, '1');
      
      setTotalPresets(1);
      setCurrentPresetNumber(1);
      setFormFields(DEFAULT_FORM_FIELDS);
      setCheckboxStates(DEFAULT_CHECKBOX_STATES);
      setIsDirty(false);
      
      showNotification(`프로젝트 "${currentProject}"의 모든 데이터가 초기화되었습니다.`, 'error');
    }
  };

  // 파일명 변환 및 복사
  const convertAndCopy = () => {
    try {
      const result = generateFilename(formFields, checkboxStates);
      setResult(result);
      setShowResult(true);

      // 클립보드에 복사
      navigator.clipboard.writeText(result).then(() => {
        showNotification('파일명이 클립보드에 복사되었습니다.', 'success');
        setShowCopyMessage(true);
        setTimeout(() => {
          setShowCopyMessage(false);
        }, 2000);

        // 버전 번호 증가
        setFormFields(prev => ({
          ...prev,
          version: parseInt(prev.version) + 1
        }));

        // 업데이트된 버전 번호 저장
        saveCurrentToPreset();
      });
    } catch (error) {
      showNotification(error.message, 'error');
      alert(error.message);
    }
  };

  // 프리셋 내보내기 다이얼로그 표시
  const showExportDialogHandler = () => {
    setExportFileName(currentProject);
    setShowExportDialog(true);
  };

  // 프리셋 내보내기
  const handleExport = () => {
    if (!exportFileName.trim()) {
      showNotification('파일 이름을 입력해주세요.', 'error');
      alert('파일 이름을 입력해주세요.');
      return;
    }

    exportPresets(currentProject, totalPresets, exportFileName);
    setShowExportDialog(false);
    setExportFileName('');
    
    showNotification(`프로젝트 "${currentProject}"의 프리셋이 내보내기되었습니다.`, 'success');
  };

  // 프리셋 가져오기
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { projectName, totalPresets: importedTotalPresets } = await importPresets(file);
        
        // 프로젝트 목록 업데이트
        setProjects(getProjects());
        
        // 가져온 프로젝트로 전환
        setCurrentProject(projectName);
        setTotalPresets(importedTotalPresets);
        setCurrentPresetNumber(1);
        
        // 첫 번째 프리셋 로드
        const { formFields: loadedFields, checkboxStates: loadedCheckboxes } = loadPreset(projectName, 1);
        setFormFields(loadedFields);
        setCheckboxStates(loadedCheckboxes);
        
        showNotification(`프로젝트 "${projectName}"의 프리셋을 성공적으로 가져왔습니다.`, 'success');
      } catch (error) {
        showNotification('프리셋 파일을 불러오는데 실패했습니다.', 'error');
        alert('프리셋 파일을 불러오는데 실패했습니다.');
      }
    }
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxStates(prev => ({
      ...prev,
      [name]: checked
    }));
    setIsDirty(true);
  };

  // 버전 상태 변경 핸들러
  const handleVersionStateChange = (e) => {
    const newVersionState = e.target.value;
    setFormFields(prev => ({
      ...prev,
      versionState: newVersionState
    }));

    // 버전 번호 업데이트
    const presetData = localStorage.getItem(`project_${currentProject}_preset${currentPresetNumber}`);
    let versionNumber = 1;
    
    if (presetData) {
      const parsedData = JSON.parse(presetData);
      if (newVersionState === 'prev') {
        versionNumber = parsedData.version_prev || 1;
      } else if (newVersionState === 'final') {
        versionNumber = parsedData.version_final || 1;
      }
    }

    setFormFields(prev => ({
      ...prev,
      version: versionNumber
    }));
    
    setIsDirty(true);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // 렌더링 조건 - 현재 프로젝트가 없으면 로딩 중 표시
  if (!currentProject) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>VFX Filename Generator</h2>
      
      <div className={styles.subtitle}>
        Filename converter and generator for VFX pipeline, based on Netflix naming conventions.
      </div>
      
      <div className={styles.versionInfo}>Alpha 1.3.0</div>
      
      <div className={styles.mainLayout}>
        {/* 왼쪽 섹션 */}
        <div className={styles.leftSection}>
          {/* 프로젝트 관리자 */}
          <ProjectManager
            projects={projects}
            currentProject={currentProject}
            onProjectSelect={handleSelectProject}
            onProjectAdd={handleAddProject}
            onProjectDelete={handleDeleteProject}
          />
          
          {/* 프리셋 버튼 */}
          <PresetButtons
            currentProject={currentProject}
            currentPresetNumber={currentPresetNumber}
            totalPresets={totalPresets}
            onPresetClick={handleLoadPreset}
            onAddPreset={addPreset}
            onRemovePreset={removePreset}
            presetMessage={presetMessage}
          />
          
          {/* 프리셋 매니저 */}
          <PresetManager
            showExportDialog={showExportDialog}
            exportFileName={exportFileName}
            onExportFileNameChange={setExportFileName}
            onExport={showExportDialogHandler}
            onCancelExport={() => setShowExportDialog(false)}
            onImport={handleImport}
            fileInputRef={fileInputRef}
          />
        </div>
        
        {/* 오른쪽 섹션 */}
        <div className={styles.rightSection}>
          {/* 폼 필드 */}
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              {/* 현재 프리셋 번호 표시 */}
              <div className={styles.currentPresetInfo}>
                <FontAwesomeIcon icon={faLayerGroup} className={styles.presetIcon} />
                <span className={styles.presetTitle}>{currentPresetNumber}</span>
              </div>
              
              <div className={styles.settingsArea}>
                <button 
                  className={styles.toggleButton} 
                  onClick={() => setShowCheckboxes(!showCheckboxes)}
                >
                  <FontAwesomeIcon icon={faCog} />
                  {showCheckboxes ? 'Hide Settings' : 'Settings'}
                </button>
                
                {/* 통합된 알림 컴포넌트 */}
                {notification.visible && (
                  <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <FontAwesomeIcon 
                      icon={notification.type === 'success' ? faCheckCircle : faExclamationCircle} 
                      className={styles.notificationIcon}
                    />
                    <span>{notification.text}</span>
                  </div>
                )}
              </div>
            </div>
            
            {showCheckboxes && (
              <div className={styles.checkboxContainer}>
                <label>
                  <input
                    type="checkbox"
                    name="includeProjectName"
                    checked={true}
                    disabled
                  />
                  Project Name
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="includeProduct"
                    checked={true}
                    disabled
                  />
                  Product
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="includeCutName"
                    checked={true}
                    disabled
                  />
                  Cut Name
                </label>
                {OPTIONAL_FIELDS.map(field => (
                  <label key={field.id}>
                    <input
                      type="checkbox"
                      name={field.id}
                      checked={checkboxStates[field.id]}
                      onChange={handleCheckboxChange}
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            )}
            
            <div className={styles.formFields}>
              <FormFields
                formFields={formFields}
                checkboxStates={checkboxStates}
                showCheckboxes={showCheckboxes}
                onInputChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                onVersionStateChange={handleVersionStateChange}
              />
            </div>
          </div>
          
          {/* 버튼 컨테이너 */}
          <div className={styles.convertButtonContainer}>
            <button 
              className={styles.savePresetButton} 
              onClick={saveCurrentToPreset}
            >
              <FontAwesomeIcon icon={faSave} /> Save Preset
            </button>
            <button 
              className={styles.convertButton} 
              onClick={convertAndCopy}
            >
              <FontAwesomeIcon icon={faFileSignature} /> Convert & Copy
            </button>
            <button 
              className={styles.resetButton} 
              onClick={resetCurrentPreset}
            >
              <FontAwesomeIcon icon={faRedo} /> Reset Preset
            </button>
            <button 
              className={styles.resetButton} 
              onClick={resetProjectData}
            >
              <FontAwesomeIcon icon={faTrash} /> Reset All
            </button>
          </div>
          
          {/* 결과 컨테이너 */}
          <div className={styles.resultContainer}>
            {showResult && (
              <div className={styles.result}>
                {result}
              </div>
            )}
            {showCopyMessage && (
              <div className={styles.copyMessage}>
                복사가 완료되었습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilenameGenerator; 