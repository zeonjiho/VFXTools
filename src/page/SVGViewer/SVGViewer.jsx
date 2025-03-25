import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './SVGViewer.module.css';

const SVGViewer = () => {
  const [svgData, setSvgData] = useState(null);
  const [svgText, setSvgText] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState({ visible: false, text: '', type: 'success' });
  
  const fileInputRef = useRef(null);
  const notificationTimerRef = useRef(null);
  
  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.svg')) {
      showNotification('SVG 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const svgText = event.target.result;
      setSvgText(svgText);
      setSvgData(svgText);
      showNotification('SVG 파일이 성공적으로 로드되었습니다.', 'success');
    };
    
    reader.onerror = () => {
      showNotification('파일을 읽는 중 오류가 발생했습니다.', 'error');
    };
    
    reader.readAsText(file);
  };
  
  // SVG 텍스트 직접 입력 처리
  const handleSVGTextChange = (e) => {
    setSvgText(e.target.value);
  };
  
  // SVG 텍스트 적용
  const applySVGText = () => {
    if (!svgText.trim()) {
      showNotification('SVG 코드를 입력해주세요.', 'error');
      return;
    }
    
    if (!svgText.includes('<svg')) {
      showNotification('유효한 SVG 코드를 입력해주세요.', 'error');
      return;
    }
    
    setSvgData(svgText);
    showNotification('SVG 코드가 적용되었습니다.', 'success');
  };
  
  // 알림 표시
  const showNotification = (text, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({ text, type, visible: true });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // 기본 SVG 예제 로드
  const loadExample = () => {
    const exampleSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="#00ff00" />
        <circle cx="50" cy="50" r="20" fill="#ff0000" />
      </svg>
    `;
    
    setSvgText(exampleSVG);
    setSvgData(exampleSVG);
    setFileName('example.svg');
    showNotification('예제 SVG가 로드되었습니다.', 'success');
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SVG 뷰어</h1>
      <div className={styles.subtitle}>SVG 파일을 업로드하여 확인하세요</div>
      
      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          {/* 파일 업로드 영역 */}
          <div className={styles.uploadSection}>
            <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
              <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
              <p>SVG 파일을 클릭하여 업로드하거나 끌어서 놓으세요</p>
              {fileName && <div className={styles.fileName}>{fileName}</div>}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".svg"
                className={styles.fileInput}
              />
            </div>
          </div>
          
          {/* 직접 SVG 코드 입력 영역 */}
          <div className={styles.codeInputSection}>
            <div className={styles.sectionHeader}>
              <h3>SVG 코드 직접 입력</h3>
              <button className={styles.applyButton} onClick={applySVGText}>
                <FontAwesomeIcon icon={faCheck} /> 적용
              </button>
            </div>
            <textarea 
              className={styles.codeInput}
              value={svgText}
              onChange={handleSVGTextChange}
              placeholder="여기에 SVG 코드를 붙여넣으세요"
            />
            <div className={styles.codeActions}>
              <button className={styles.loadExampleButton} onClick={loadExample}>
                예제 로드
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.rightSection}>
          {/* SVG 미리보기 영역 */}
          <div className={styles.previewContainer}>
            {svgData ? (
              <div 
                className={styles.svgPreview} 
                dangerouslySetInnerHTML={{ __html: svgData }} 
              />
            ) : (
              <div className={styles.emptyPreview}>
                <p>SVG 파일을 업로드하거나 코드를 입력하여 미리보기를 확인하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 알림 */}
      {notification.visible && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.text}
        </div>
      )}
    </div>
  );
};

export default SVGViewer; 