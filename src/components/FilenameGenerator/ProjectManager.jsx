import React, { useState } from 'react';
import styles from '../../page/FilenameGenerator/FilenameGenerator.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

const ProjectManager = ({ 
  projects, 
  currentProject, 
  onProjectSelect, 
  onProjectAdd, 
  onProjectDelete 
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onProjectAdd(newProjectName.trim());
      setNewProjectName('');
      setShowAddForm(false);
    }
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`프로젝트 "${project}"와 관련된 모든 프리셋이 삭제됩니다. 계속하시겠습니까?`)) {
      onProjectDelete(project);
    }
  };

  return (
    <div className={styles.projectManager}>
      <div className={styles.projectHeader}>
        <h3>Project</h3>
        <button 
          className={styles.addProjectButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addProjectForm}>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="새 프로젝트 이름"
          />
          <button onClick={handleAddProject}>추가</button>
        </div>
      )}

      <div className={styles.projectList}>
        {projects.length === 0 ? (
          <div className={styles.noProjects}>프로젝트가 없습니다. 새 프로젝트를 추가해 주세요.</div>
        ) : (
          projects.map(project => (
            <div 
              key={project} 
              className={`${styles.projectItem} ${currentProject === project ? styles.selectedProject : ''}`}
            >
              <div 
                className={styles.projectName}
                onClick={() => onProjectSelect(project)}
              >
                {project}
              </div>
              
              <div className={styles.projectActions}>
                <button 
                  className={styles.deleteProjectButton}
                  onClick={() => handleDeleteProject(project)}
                  disabled={projects.length === 1}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManager; 