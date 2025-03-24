import { DEFAULT_FORM_FIELDS, DEFAULT_CHECKBOX_STATES } from '../constants/filenameGenerator';

// 프로젝트 관련 유틸리티 함수
export const saveProject = (projectName) => {
  // 이미 저장된 프로젝트 목록 가져오기
  const projects = getProjects();
  
  // 이미 있는 프로젝트인지 확인
  if (!projects.includes(projectName)) {
    projects.push(projectName);
    localStorage.setItem('filenameProjects', JSON.stringify(projects));
    
    // 새 프로젝트의 프리셋 수 초기화
    localStorage.setItem(`project_${projectName}_totalPresets`, '1');
  }
  
  return projects;
};

export const deleteProject = (projectName) => {
  const projects = getProjects();
  const newProjects = projects.filter(p => p !== projectName);
  localStorage.setItem('filenameProjects', JSON.stringify(newProjects));
  
  // 프로젝트 관련 모든 데이터 삭제
  const totalPresets = localStorage.getItem(`project_${projectName}_totalPresets`) || 1;
  for (let i = 1; i <= totalPresets; i++) {
    localStorage.removeItem(`project_${projectName}_preset${i}`);
  }
  localStorage.removeItem(`project_${projectName}_totalPresets`);
  
  return newProjects;
};

export const getProjects = () => {
  const projectsJSON = localStorage.getItem('filenameProjects');
  return projectsJSON ? JSON.parse(projectsJSON) : [];
};

// 프리셋 저장 함수 (프로젝트별)
export const savePreset = (projectName, presetNumber, formFields, checkboxStates) => {
  const presetData = {
    ...formFields,
    checkboxStates,
    version_prev: formFields.versionState === 'prev' ? formFields.version : undefined,
    version_final: formFields.versionState === 'final' ? formFields.version : undefined
  };

  localStorage.setItem(`project_${projectName}_preset${presetNumber}`, JSON.stringify(presetData));
  localStorage.setItem(`project_${projectName}_totalPresets`, presetNumber.toString());
};

// 프리셋 로드 함수 (프로젝트별)
export const loadPreset = (projectName, presetNumber) => {
  const presetData = localStorage.getItem(`project_${projectName}_preset${presetNumber}`);
  if (presetData) {
    const parsedData = JSON.parse(presetData);
    return {
      formFields: {
        ...DEFAULT_FORM_FIELDS,
        ...parsedData,
        version: parsedData.version_state === 'prev' 
          ? parsedData.version_prev || 1 
          : parsedData.version_final || 1
      },
      checkboxStates: parsedData.checkboxStates || DEFAULT_CHECKBOX_STATES
    };
  }
  return {
    formFields: DEFAULT_FORM_FIELDS,
    checkboxStates: DEFAULT_CHECKBOX_STATES
  };
};

// 프리셋 툴팁 데이터 가져오기 (프로젝트별)
export const getPresetTooltip = (projectName, presetNumber) => {
  const presetData = localStorage.getItem(`project_${projectName}_preset${presetNumber}`);
  if (presetData) {
    try {
      const parsedData = JSON.parse(presetData);
      const pName = parsedData.projectName?.trim() || '';
      const product = parsedData.product?.trim() || '';
      const cutName = parsedData.cutName?.trim() || '';

      if (!pName && !product && !cutName) {
        return `Preset ${presetNumber}\n(Empty)`;
      }

      let tooltipContent = `Preset ${presetNumber}\n`;
      if (pName) tooltipContent += `Project: ${pName}\n`;
      if (product) tooltipContent += `Product: ${product}\n`;
      if (cutName) tooltipContent += `Cut Name: ${cutName}`;
      
      return tooltipContent;
    } catch (e) {
      return `Preset ${presetNumber}\n(Data Error)`;
    }
  }
  return `Preset ${presetNumber}\n(Empty)`;
};

// 프리셋 내보내기 (프로젝트별)
export const exportPresets = (projectName, totalPresets, fileName) => {
  const presets = {};
  for (let i = 1; i <= totalPresets; i++) {
    const presetData = localStorage.getItem(`project_${projectName}_preset${i}`);
    if (presetData) {
      presets[`preset${i}`] = JSON.parse(presetData);
    }
  }

  const exportData = {
    projectName,
    presets,
    totalPresets,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

// 프리셋 가져오기 (프로젝트별)
export const importPresets = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        if (importData.presets && importData.totalPresets) {
          const projectName = importData.projectName || 'imported_project';
          
          // 기존 프로젝트가 있는지 확인
          const projects = getProjects();
          if (!projects.includes(projectName)) {
            saveProject(projectName);
          }
          
          // 기존 프리셋 삭제
          const existingTotalPresets = parseInt(localStorage.getItem(`project_${projectName}_totalPresets`)) || 1;
          for (let i = 1; i <= existingTotalPresets; i++) {
            localStorage.removeItem(`project_${projectName}_preset${i}`);
          }

          // 프리셋 가져오기
          for (let key in importData.presets) {
            const presetNumber = key.replace('preset', '');
            localStorage.setItem(`project_${projectName}_${key}`, JSON.stringify(importData.presets[key]));
          }
          localStorage.setItem(`project_${projectName}_totalPresets`, importData.totalPresets);

          resolve({
            projectName,
            totalPresets: importData.totalPresets
          });
        } else {
          reject(new Error('Invalid preset file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}; 