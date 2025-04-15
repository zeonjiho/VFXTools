import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './FilenameGenerator.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faSave, faRedo, faTrash, faCog, faBell, faCheckCircle, faExclamationCircle, faLayerGroup, faFilm, faTheaterMasks } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
import { useSidebar } from '../../layout/AppLayout/AppLayout';

// PresetCard 컴포넌트 - 프리셋 카드 렌더링
const PresetCard = React.memo(({ 
  currentProject, 
  presetNumber, 
  totalPresets, 
  currentPresetNumber, 
  handleLoadPreset, 
  provided, 
  snapshot 
}) => {
  // 프리셋 데이터 로드
  const { formFields: presetData } = loadPreset(currentProject, presetNumber);

  return (
    <div 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.presetCard} ${currentPresetNumber === presetNumber ? styles.activePreset : ''} ${snapshot.isDragging ? styles.dragging : ''}`}
      onClick={() => handleLoadPreset(presetNumber)}
      style={{...provided.draggableProps.style}}
    >
      <div className={styles.presetCardHeader}>
        <span className={styles.presetNumber}>#{presetNumber}</span>
        <span className={styles.presetTitle}>
          {presetData.product && presetData.cutName ? 
            `${presetData.product} - ${presetData.cutName}` : 
            'New Cut'}
        </span>
        {currentPresetNumber === presetNumber && (
          <span className={styles.activeIndicator}>Editing</span>
        )}
      </div>
      <div className={styles.presetCardContent}>
        <div className={styles.presetDataRow}>
          <span className={styles.presetDataLabel}>Project:</span>
          <span className={styles.presetDataValue}>{presetData.projectName || '-'}</span>
        </div>
        {presetData.task && (
          <div className={styles.presetDataRow}>
            <span className={styles.presetDataLabel}>Task:</span>
            <span className={styles.presetDataValue}>{presetData.task}</span>
          </div>
        )}
        {presetData.vendor && (
          <div className={styles.presetDataRow}>
            <span className={styles.presetDataLabel}>Vendor:</span>
            <span className={styles.presetDataValue}>{presetData.vendor}</span>
          </div>
        )}
        {presetData.version && (
          <div className={styles.presetDataRow}>
            <span className={styles.presetDataLabel}>Version:</span>
            <span className={styles.presetDataValue}>
              {presetData.versionState === 'prev' && 'P'}
              {presetData.versionState === 'final' && 'F'}
              {presetData.version}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

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
  
  // 탭 관리
  const [activeTab, setActiveTab] = useState('cuts'); // 'cuts' 또는 'settings'
  
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

  // 사이드바 컨텍스트 사용
  const { setRightSidebarContent, setRightSidebarVisible, setRightSidebarTitle } = useSidebar();

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
  const showNotification = useCallback((text, type = 'success') => {
    // 이전 타이머가 있으면 제거
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({ text, type, visible: true });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
      notificationTimerRef.current = null;
    }, 5000);
  }, []);

  // 메시지 표시 함수 - 호환성 유지
  const displayPresetMessage = useCallback((text, isPositive) => {
    setPresetMessage({ text, isPositive, visible: true });
    showNotification(text, isPositive ? 'success' : 'error');
    setTimeout(() => {
      setPresetMessage(prev => ({ ...prev, visible: false }));
    }, 5000);
  }, [showNotification]);

  // 프로젝트 추가
  const handleAddProject = useCallback((projectName) => {
    const updatedProjects = saveProject(projectName);
    setProjects(updatedProjects);
    setCurrentProject(projectName);
    showNotification(`새 프로젝트 "${projectName}"이(가) 생성되었습니다.`, 'success');
  }, [showNotification]);

  // 프로젝트 삭제
  const handleDeleteProject = useCallback((projectName) => {
    const updatedProjects = deleteProject(projectName);
    setProjects(updatedProjects);
    
    if (currentProject === projectName) {
      setCurrentProject(updatedProjects[0] || '');
    }
    
    showNotification(`프로젝트 "${projectName}"이(가) 삭제되었습니다.`, 'error');
  }, [currentProject, showNotification]);

  // 프로젝트 선택
  const handleSelectProject = useCallback((projectName) => {
    if (isDirty) {
      if (!window.confirm('저장되지 않은 변경 사항이 있습니다. 정말로 프로젝트를 전환하시겠습니까?')) {
        return;
      }
    }
    
    setCurrentProject(projectName);
    showNotification(`프로젝트 "${projectName}"로 전환했습니다.`, 'success');
  }, [isDirty, showNotification]);

  // 프리셋 추가
  const addPreset = useCallback(() => {
    if (totalPresets < MAX_PRESETS) {
      // 현재 프리셋 번호 저장
      const newTotalPresets = totalPresets + 1;
      
      // 현재 프리셋 데이터를 새 프리셋에 복사
      savePreset(currentProject, newTotalPresets, formFields, checkboxStates);
      
      // 프로젝트의 총 프리셋 수 저장
      localStorage.setItem(`project_${currentProject}_totalPresets`, newTotalPresets.toString());
      
      // 상태 업데이트
      setTotalPresets(newTotalPresets);
      
      showNotification(`새 컷 #${newTotalPresets}이(가) 추가되었습니다.`, 'success');
    } else {
      showNotification('더 이상 컷을 추가할 수 없습니다. 최대 개수에 도달했습니다.', 'error');
    }
  }, [totalPresets, currentProject, formFields, checkboxStates, showNotification]);

  // 프리셋 제거
  const removePreset = useCallback(() => {
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
    }
  }, [totalPresets, currentProject, currentPresetNumber, showNotification]);

  // 현재 프리셋 저장
  const saveCurrentToPreset = useCallback(() => {
    const { projectName, product, cutName } = formFields;

    // 필드 검증
    if (!projectName.trim() || !product.trim() || !cutName.trim()) {
      showNotification('저장할 데이터가 없습니다.', 'error');
      return;
    }

    savePreset(currentProject, currentPresetNumber, formFields, checkboxStates);
    showNotification(`프리셋 ${currentPresetNumber}이(가) 저장되었습니다.`, 'success');
    setIsDirty(false);
  }, [formFields, currentProject, currentPresetNumber, checkboxStates, showNotification]);

  // 프리셋 로드
  const handleLoadPreset = useCallback((presetNumber) => {
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
  }, [isDirty, currentProject, showNotification]);

  // 현재 프리셋 초기화
  const resetCurrentPreset = useCallback(() => {
    if (window.confirm('현재 프리셋의 모든 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem(`project_${currentProject}_preset${currentPresetNumber}`);
      showNotification(`프리셋 ${currentPresetNumber}이(가) 초기화되었습니다.`, 'error');
      
      setFormFields(DEFAULT_FORM_FIELDS);
      setCheckboxStates(DEFAULT_CHECKBOX_STATES);
      setIsDirty(false);
    }
  }, [currentProject, currentPresetNumber, showNotification]);

  // 현재 프로젝트의 모든 데이터 초기화
  const resetProjectData = useCallback(() => {
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
  }, [currentProject, totalPresets, showNotification]);

  // 파일명 변환 및 복사
  const convertAndCopy = useCallback(() => {
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
    }
  }, [formFields, checkboxStates, showNotification, saveCurrentToPreset]);

  // 프리셋 내보내기 다이얼로그 표시
  const showExportDialogHandler = useCallback(() => {
    setExportFileName(currentProject);
    setShowExportDialog(true);
  }, [currentProject]);

  // 프리셋 내보내기
  const handleExport = useCallback(() => {
    if (!exportFileName.trim()) {
      showNotification('파일 이름을 입력해주세요.', 'error');
      return;
    }

    exportPresets(currentProject, totalPresets, exportFileName);
    setShowExportDialog(false);
    setExportFileName('');
    
    showNotification(`프로젝트 "${currentProject}"의 프리셋이 내보내기되었습니다.`, 'success');
  }, [exportFileName, currentProject, totalPresets, showNotification]);

  // 프리셋 가져오기
  const handleImport = useCallback(async (e) => {
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
      }
    }
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showNotification]);

  // 폼 필드 변경 핸들러
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  }, []);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setCheckboxStates(prev => ({
      ...prev,
      [name]: checked
    }));
    setIsDirty(true);
  }, []);

  // 버전 상태 변경 핸들러
  const handleVersionStateChange = useCallback((e) => {
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
  }, [currentProject, currentPresetNumber]);

  // 개선된 드래그 종료 핸들러
  const handleDragEnd = useCallback((result) => {
    // 드롭 위치가 없으면 종료
    if (!result.destination) return;
    
    const sourceIndex = result.source.index + 1; // 1 기반 인덱스로 변환
    const destinationIndex = result.destination.index + 1; // 1 기반 인덱스로 변환
    
    if (sourceIndex === destinationIndex) return; // 변경 없음

    try {
      // 모든 프리셋 데이터를 메모리에 캐시
      const presetsData = [];
      for (let i = 1; i <= totalPresets; i++) {
        const key = `project_${currentProject}_preset${i}`;
        const data = localStorage.getItem(key);
        presetsData.push({ key, data });
      }
      
      // 배열 재정렬
      const reorderedPresets = [...presetsData];
      const [movedPreset] = reorderedPresets.splice(sourceIndex - 1, 1);
      reorderedPresets.splice(destinationIndex - 1, 0, movedPreset);
      
      // 로컬 스토리지에 재정렬된 프리셋 저장
      reorderedPresets.forEach((preset, index) => {
        const newKey = `project_${currentProject}_preset${index + 1}`;
        localStorage.setItem(newKey, preset.data);
      });
      
      // 현재 선택된 프리셋 번호 업데이트
      let newCurrentPresetNumber = currentPresetNumber;
      if (currentPresetNumber === sourceIndex) {
        // 현재 선택된 프리셋을 이동한 경우
        newCurrentPresetNumber = destinationIndex;
      } else if (
        (sourceIndex < destinationIndex && currentPresetNumber > sourceIndex && currentPresetNumber <= destinationIndex) ||
        (sourceIndex > destinationIndex && currentPresetNumber < sourceIndex && currentPresetNumber >= destinationIndex)
      ) {
        // 이동된 프리셋이 현재 선택된 프리셋에 영향을 주는 경우
        newCurrentPresetNumber = sourceIndex < destinationIndex ? 
          currentPresetNumber - 1 : currentPresetNumber + 1;
      }
      
      setCurrentPresetNumber(newCurrentPresetNumber);
      showNotification(`컷 ${sourceIndex}이(가) 위치 ${destinationIndex}(으)로 이동되었습니다.`, 'success');
      
      // 현재 프리셋 데이터 다시 로드
      const { formFields: loadedFields, checkboxStates: loadedCheckboxes } = 
        loadPreset(currentProject, newCurrentPresetNumber);
      setFormFields(loadedFields);
      setCheckboxStates(loadedCheckboxes);
      
    } catch (error) {
      console.error("드래그 작업 중 오류 발생:", error);
      showNotification("컷 순서 변경에 실패했습니다. 다시 시도해주세요.", 'error');
    }
  }, [currentProject, totalPresets, currentPresetNumber, showNotification]);

  // 사이드바에 폼 필드 콘텐츠 설정
  useEffect(() => {
    const sidebarContent = (
      <div className={styles.sidebarFormContainer}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>
            <FontAwesomeIcon icon={faFileSignature} className={styles.sidebarIcon} />
            Filename Form
          </h3>
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
        
        {/* 설정 토글 버튼 */}
        <div className={styles.settingsToggle}>
          <button 
            className={styles.toggleButton} 
            onClick={() => setShowCheckboxes(!showCheckboxes)}
          >
            <FontAwesomeIcon icon={faCog} />
            {showCheckboxes ? 'Hide Settings' : 'Settings'}
          </button>
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
        
        {/* 폼 필드 */}
        <FormFields
          formFields={formFields}
          checkboxStates={checkboxStates}
          showCheckboxes={showCheckboxes}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onVersionStateChange={handleVersionStateChange}
        />
        
        {/* 버튼 컨테이너 */}
        <div className={styles.sidebarButtonsContainer}>
          <button 
            className={styles.savePresetButton} 
            onClick={saveCurrentToPreset}
          >
            <FontAwesomeIcon icon={faSave} /> Save Cut
          </button>
          <button 
            className={styles.convertButton} 
            onClick={convertAndCopy}
          >
            <FontAwesomeIcon icon={faFileSignature} /> Convert & Copy
          </button>
        </div>
      </div>
    );
    
    setRightSidebarContent(sidebarContent);
    setRightSidebarTitle('Filename Generator');
    setRightSidebarVisible(true);
    
    // 컴포넌트 언마운트시 사이드바 닫기
    return () => {
      setRightSidebarVisible(false);
    };
  }, [
    formFields, 
    checkboxStates, 
    showCheckboxes, 
    notification, 
    currentPresetNumber, 
    handleCheckboxChange, 
    handleInputChange, 
    handleVersionStateChange,
    saveCurrentToPreset,
    convertAndCopy
  ]);

  // 렌더링 조건 - 현재 프로젝트가 없으면 로딩 중 표시
  if (!currentProject) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>VFX Filename Generator</h2>
      
      <div className={styles.subtitle}>
        Filename converter and generator for VFX pipeline, based on Netflix naming conventions.
      </div>
      
      <div className={styles.versionInfo}>Alpha 1.4.0</div>

      {/* 탭 메뉴 */}
      <div className={styles.tabsContainer}>
        <div 
          className={`${styles.tab} ${activeTab === 'cuts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('cuts')}
        >
          <FontAwesomeIcon icon={faFilm} className={styles.tabIcon} />
          <span>Cuts</span>
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FontAwesomeIcon icon={faTheaterMasks} className={styles.tabIcon} />
          <span>Scene Settings</span>
        </div>
        
        {showResult && (
          <div className={styles.resultTab}>
            <code className={styles.resultText}>{result}</code>
            {showCopyMessage && (
              <div className={styles.copyBadge}>
                <FontAwesomeIcon icon={faCheckCircle} /> Copied
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cuts 탭 내용 */}
      {activeTab === 'cuts' && (
        <div className={styles.presetsSection}>
          <div className={styles.presetsSectionHeader}>
            <div className={styles.presetTitleWrapper}>
              <FontAwesomeIcon icon={faFilm} className={styles.headerIcon} />
              <h3 className={styles.sectionTitle}>
                Cuts <span className={styles.projectIndicator}>({currentProject})</span>
              </h3>
            </div>
            <div className={styles.presetControls}>
              <button 
                className={styles.addPresetButton} 
                onClick={addPreset} 
                disabled={totalPresets >= MAX_PRESETS}
                title="Add new cut"
              >
                <FontAwesomeIcon icon={faSave} /> New Cut
              </button>
              <button 
                className={styles.removePresetButton} 
                onClick={removePreset} 
                disabled={totalPresets <= 1}
                title="Remove last cut"
              >
                <FontAwesomeIcon icon={faTrash} /> Remove
              </button>
            </div>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="presets" direction="horizontal">
              {(provided) => (
                <div 
                  className={styles.presetCardsContainer}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {[...Array(totalPresets)].map((_, index) => {
                    const presetNumber = index + 1;
                    return (
                      <Draggable 
                        key={`preset-${currentProject}-${presetNumber}`} 
                        draggableId={`preset-${currentProject}-${presetNumber}`} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <PresetCard
                            currentProject={currentProject}
                            presetNumber={presetNumber}
                            totalPresets={totalPresets}
                            currentPresetNumber={currentPresetNumber}
                            handleLoadPreset={handleLoadPreset}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Settings 탭 내용 */}
      {activeTab === 'settings' && (
        <div className={styles.settingsSection}>
          <div className={styles.settingsGrid}>
            <div className={styles.settingsCard}>
              <div className={styles.settingsCardHeader}>
                <FontAwesomeIcon icon={faLayerGroup} className={styles.headerIcon} />
                <h3 className={styles.settingsTitle}>Projects</h3>
              </div>
              
              <div className={styles.projectContainer}>
                <ProjectManager
                  projects={projects}
                  currentProject={currentProject}
                  onProjectSelect={handleSelectProject}
                  onProjectAdd={handleAddProject}
                  onProjectDelete={handleDeleteProject}
                />
              </div>
            </div>
            
            <div className={styles.settingsCard}>
              <div className={styles.settingsCardHeader}>
                <FontAwesomeIcon icon={faCog} className={styles.headerIcon} />
                <h3 className={styles.settingsTitle}>Management</h3>
              </div>
              
              <div className={styles.actionButtonsContainer}>
                <button 
                  className={styles.actionButton} 
                  onClick={resetCurrentPreset}
                  title="Reset current cut data"
                >
                  <FontAwesomeIcon icon={faRedo} /> Reset Current Cut
                </button>
                <button 
                  className={styles.actionButton} 
                  onClick={resetProjectData}
                  title="Reset all cuts in this project"
                >
                  <FontAwesomeIcon icon={faTrash} /> Reset All Cuts
                </button>
                <button 
                  className={styles.actionButton} 
                  onClick={showExportDialogHandler}
                  title="Export project cuts"
                >
                  <FontAwesomeIcon icon={faSave} /> Export
                </button>
                <label 
                  className={styles.actionButton}
                  title="Import project cuts"
                >
                  <FontAwesomeIcon icon={faFileSignature} /> Import
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    style={{ display: 'none' }}
                    accept=".json"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 내보내기 다이얼로그 */}
      {showExportDialog && (
        <div className={styles.exportDialog}>
          <div className={styles.dialogContent}>
            <h3>Export Cuts</h3>
            <input
              type="text"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              placeholder="Enter file name"
            />
            <div className={styles.dialogButtons}>
              <button id="confirmExport" onClick={handleExport}>Export</button>
              <button id="cancelExport" onClick={() => setShowExportDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilenameGenerator; 