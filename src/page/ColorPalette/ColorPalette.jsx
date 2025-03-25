import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCopy, faCheck, faTrash, faImage, faPalette, faDownload } from '@fortawesome/free-solid-svg-icons';
import styles from './ColorPalette.module.css';

const ColorPalette = () => {
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState({ visible: false, text: '', type: 'success' });
  const [colorCount, setColorCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const notificationTimerRef = useRef(null);
  
  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      showNotification('유효한 이미지 파일을 업로드해주세요 (JPEG, PNG, GIF, WEBP)', 'error');
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      extractColors(event.target.result);
    };
    
    reader.onerror = () => {
      showNotification('파일을 읽는 중 오류가 발생했습니다.', 'error');
    };
    
    reader.readAsDataURL(file);
  };
  
  // 이미지에서 색상 추출
  const extractColors = (imageUrl) => {
    setLoading(true);
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      // Canvas 생성 및 이미지 그리기
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 이미지 크기 조정 (성능을 위해)
      const maxSize = 100;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxSize) {
        height = height * (maxSize / width);
        width = maxSize;
      } else if (height > width && height > maxSize) {
        width = width * (maxSize / height);
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // 픽셀 데이터 가져오기
      const imageData = ctx.getImageData(0, 0, width, height).data;
      
      // 색상 추출
      const colors = getColorsFromImageData(imageData, colorCount);
      
      setColors(colors);
      setLoading(false);
      showNotification('색상 추출 완료!', 'success');
    };
    
    img.onerror = () => {
      setLoading(false);
      showNotification('이미지 처리 중 오류가 발생했습니다.', 'error');
    };
    
    img.src = imageUrl;
  };
  
  // 픽셀 데이터에서 대표 색상 추출
  const getColorsFromImageData = (imageData, colorCount) => {
    // 모든 픽셀 가져오기
    const pixels = [];
    
    // 픽셀 매 4번째 요소가 하나의 픽셀을 나타냄 (RGBA)
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      
      // 완전히 투명한 픽셀은 무시
      if (a < 128) continue;
      
      pixels.push([r, g, b]);
    }
    
    // 단순화된 색상 추출 알고리즘 (색상 양자화)
    // 실제 프로덕션에서는 k-means 클러스터링 같은 더 정교한 알고리즘 추천
    const buckets = {};
    
    // 색상 양자화 (간단한 방식)
    const step = 24; // 양자화 스텝
    
    pixels.forEach(([r, g, b]) => {
      // 색상을 버킷으로 그룹화
      const rBucket = Math.round(r / step) * step;
      const gBucket = Math.round(g / step) * step;
      const bBucket = Math.round(b / step) * step;
      
      const key = `${rBucket}-${gBucket}-${bBucket}`;
      
      if (!buckets[key]) {
        buckets[key] = {
          count: 0,
          r: 0,
          g: 0,
          b: 0
        };
      }
      
      buckets[key].count++;
      buckets[key].r += r;
      buckets[key].g += g;
      buckets[key].b += b;
    });
    
    // 버킷에서 평균 색상 계산
    const colorBuckets = Object.values(buckets).map(bucket => ({
      color: [
        Math.round(bucket.r / bucket.count),
        Math.round(bucket.g / bucket.count),
        Math.round(bucket.b / bucket.count)
      ],
      count: bucket.count
    }));
    
    // 가장 많이 사용된 색상으로 정렬
    colorBuckets.sort((a, b) => b.count - a.count);
    
    // 상위 N개 색상 선택
    return colorBuckets.slice(0, colorCount).map(bucket => {
      const [r, g, b] = bucket.color;
      return {
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: rgbToHex(r, g, b),
        count: bucket.count
      };
    });
  };
  
  // RGB를 HEX로 변환
  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };
  
  // 색상 코드 복사
  const copyColorToClipboard = (colorCode) => {
    navigator.clipboard.writeText(colorCode)
      .then(() => {
        setSelectedColor(colorCode);
        showNotification(`색상 코드 "${colorCode}" 복사됨!`, 'success');
        setTimeout(() => setSelectedColor(null), 1000);
      })
      .catch(() => {
        showNotification('색상 코드를 복사하는데 실패했습니다.', 'error');
      });
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
  
  // 팔레트 초기화
  const resetPalette = () => {
    setImage(null);
    setColors([]);
    setFileName('');
    showNotification('팔레트가 초기화되었습니다.', 'info');
  };
  
  // 팔레트 이미지로 저장
  const savePaletteAsImage = () => {
    if (colors.length === 0) {
      showNotification('저장할 팔레트가 없습니다.', 'error');
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const width = colors.length * 100;
    const height = 200;
    
    canvas.width = width;
    canvas.height = height;
    
    // 배경 (검정)
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);
    
    // 각 색상 그리기
    colors.forEach((color, i) => {
      ctx.fillStyle = color.rgb;
      ctx.fillRect(i * 100, 0, 100, 150);
      
      // 색상 코드 텍스트
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(color.hex, i * 100 + 10, 170);
      ctx.fillText(color.rgb, i * 100 + 10, 190);
    });
    
    // 이미지 다운로드
    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showNotification('팔레트 이미지가 저장되었습니다!', 'success');
  };
  
  // 컬러 수 변경 처리
  const handleColorCountChange = (e) => {
    const value = parseInt(e.target.value);
    setColorCount(value);
    
    if (image) {
      extractColors(image);
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>이미지 컬러 팔레트</h1>
      <div className={styles.subtitle}>이미지를 업로드하여 컬러 팔레트를 생성하세요</div>
      
      <div className={styles.settings}>
        <div className={styles.settingItem}>
          <label htmlFor="colorCount">추출할 색상 수:</label>
          <input
            type="range"
            id="colorCount"
            min="2"
            max="12"
            value={colorCount}
            onChange={handleColorCountChange}
          />
          <span>{colorCount}</span>
        </div>
      </div>
      
      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          {/* 이미지 업로드 영역 */}
          <div className={styles.uploadSection}>
            <div 
              className={styles.uploadArea} 
              onClick={() => fileInputRef.current.click()}
              style={image ? { backgroundImage: `url(${image})` } : {}}
            >
              {!image && (
                <>
                  <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
                  <p>이미지를 클릭하여 업로드하거나 끌어서 놓으세요</p>
                  {fileName && <div className={styles.fileName}>{fileName}</div>}
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className={styles.fileInput}
              />
            </div>
            
            {image && (
              <div className={styles.imageActions}>
                <button className={styles.resetButton} onClick={resetPalette}>
                  <FontAwesomeIcon icon={faTrash} /> 초기화
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.rightSection}>
          {/* 컬러 팔레트 영역 */}
          <div className={styles.paletteContainer}>
            {loading ? (
              <div className={styles.loadingSpinner}>색상 분석 중...</div>
            ) : colors.length > 0 ? (
              <>
                <div className={styles.paletteHeader}>
                  <h3>
                    <FontAwesomeIcon icon={faPalette} /> 추출된 색상 팔레트
                  </h3>
                  <button className={styles.saveButton} onClick={savePaletteAsImage}>
                    <FontAwesomeIcon icon={faDownload} /> 팔레트 저장
                  </button>
                </div>
                
                <div className={styles.paletteGrid}>
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className={styles.colorItem}
                      style={{ backgroundColor: color.rgb }}
                      onClick={() => copyColorToClipboard(color.hex)}
                    >
                      <div className={styles.colorInfo}>
                        <span className={styles.colorHex}>{color.hex}</span>
                        <span className={styles.colorRgb}>{color.rgb}</span>
                        
                        {selectedColor === color.hex && (
                          <div className={styles.copiedIndicator}>
                            <FontAwesomeIcon icon={faCheck} /> 복사됨
                          </div>
                        )}
                        
                        <button className={styles.copyButton}>
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={styles.paletteHint}>
                  색상을 클릭하여 HEX 코드를 복사하세요
                </div>
              </>
            ) : (
              <div className={styles.emptyPalette}>
                <FontAwesomeIcon icon={faImage} className={styles.emptyIcon} />
                <p>이미지를 업로드하여 컬러 팔레트를 생성하세요</p>
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
      
      {/* 캔버스는 숨겨져 있음 (분석용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ColorPalette; 