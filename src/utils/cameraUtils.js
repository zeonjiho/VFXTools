/**
 * 카메라 관련 계산 유틸리티 함수들
 */

/**
 * 센서 크기와 초점거리에 따른 수평 시야각(FOV) 계산
 * @param {number} sensorWidth - 센서 가로 크기 (mm)
 * @param {number} focalLength - 렌즈 초점거리 (mm)
 * @returns {number} 수평 시야각 (도)
 */
export const calculateHorizontalFOV = (sensorWidth, focalLength) => {
  return (2 * Math.atan(sensorWidth / (2 * focalLength)) * 180) / Math.PI;
};

/**
 * 센서 크기와 초점거리에 따른 수직 시야각(FOV) 계산
 * @param {number} sensorHeight - 센서 세로 크기 (mm)
 * @param {number} focalLength - 렌즈 초점거리 (mm)
 * @returns {number} 수직 시야각 (도)
 */
export const calculateVerticalFOV = (sensorHeight, focalLength) => {
  return (2 * Math.atan(sensorHeight / (2 * focalLength)) * 180) / Math.PI;
};

/**
 * 센서 크기와 초점거리에 따른 대각선 시야각(FOV) 계산
 * @param {number} sensorDiagonal - 센서 대각선 크기 (mm)
 * @param {number} focalLength - 렌즈 초점거리 (mm)
 * @returns {number} 대각선 시야각 (도)
 */
export const calculateDiagonalFOV = (sensorDiagonal, focalLength) => {
  return (2 * Math.atan(sensorDiagonal / (2 * focalLength)) * 180) / Math.PI;
};

/**
 * 초점거리(mm)에 따른 35mm 환산 초점거리 계산
 * @param {number} focalLength - 렌즈 초점거리 (mm)
 * @param {number} cropFactor - 크롭 팩터 (35mm 대비)
 * @returns {number} 35mm 환산 초점거리
 */
export const calculateEquivalentFocalLength = (focalLength, cropFactor) => {
  return focalLength * cropFactor;
};

/**
 * 센서 크기로부터 크롭 팩터 계산 (35mm 풀프레임 기준)
 * @param {number} sensorWidth - 센서 가로 크기 (mm)
 * @returns {number} 크롭 팩터
 */
export const calculateCropFactor = (sensorWidth) => {
  const fullFrameWidth = 36; // 35mm 풀프레임 가로 크기
  return fullFrameWidth / sensorWidth;
};

/**
 * 35mm 풀프레임 대비 시야각 계산
 * @param {number} fov - 현재 시야각 (도)
 * @param {number} cropFactor - 크롭 팩터
 * @returns {number} 35mm 환산 시야각
 */
export const calculateEquivalentFOV = (fov, cropFactor) => {
  return fov * cropFactor;
};

/**
 * 시야각으로부터 화각 계산 (수평)
 * @param {number} distance - 피사체까지의 거리 (m)
 * @param {number} horizontalFOV - 수평 시야각 (도)
 * @returns {number} 수평 화각 (m)
 */
export const calculateFieldWidth = (distance, horizontalFOV) => {
  const fovRadians = (horizontalFOV * Math.PI) / 180;
  return 2 * distance * Math.tan(fovRadians / 2);
};

/**
 * 시야각으로부터 화각 계산 (수직)
 * @param {number} distance - 피사체까지의 거리 (m)
 * @param {number} verticalFOV - 수직 시야각 (도)
 * @returns {number} 수직 화각 (m)
 */
export const calculateFieldHeight = (distance, verticalFOV) => {
  const fovRadians = (verticalFOV * Math.PI) / 180;
  return 2 * distance * Math.tan(fovRadians / 2);
};

/**
 * 일반적인 렌즈 초점거리 목록 (mm)
 */
export const commonFocalLengths = [
  12, 14, 16, 18, 20, 24, 28, 35, 40, 50, 58, 85, 105, 135, 200, 300, 400, 600
];

/**
 * 풀프레임 카메라 대표적 화각
 */
export const focalLengthLabels = {
  14: 'Ultra Wide',
  24: 'Wide',
  35: 'Semi Wide',
  50: 'Standard',
  85: 'Medium Tele',
  135: 'Tele',
  200: 'Super Tele'
};

/**
 * 3D 시각화를 위한 카메라 프러스텀 계산
 * @param {number} horizontalFOV - 수평 시야각 (도)
 * @param {number} verticalFOV - 수직 시야각 (도)
 * @param {number} nearPlane - 근거리 평면 거리
 * @param {number} farPlane - 원거리 평면 거리
 * @returns {object} 프러스텀 꼭지점 좌표
 */
export const calculateFrustumVertices = (horizontalFOV, verticalFOV, nearPlane, farPlane) => {
  const halfHFOV = (horizontalFOV / 2) * (Math.PI / 180);
  const halfVFOV = (verticalFOV / 2) * (Math.PI / 180);
  
  const nearHeight = 2 * Math.tan(halfVFOV) * nearPlane;
  const nearWidth = 2 * Math.tan(halfHFOV) * nearPlane;
  
  const farHeight = 2 * Math.tan(halfVFOV) * farPlane;
  const farWidth = 2 * Math.tan(halfHFOV) * farPlane;
  
  // 프러스텀 꼭지점 좌표 (near plane 4개, far plane 4개)
  return {
    // 근거리 평면 (near plane)
    nearTopLeft: [-nearWidth/2, nearHeight/2, -nearPlane],
    nearTopRight: [nearWidth/2, nearHeight/2, -nearPlane],
    nearBottomLeft: [-nearWidth/2, -nearHeight/2, -nearPlane],
    nearBottomRight: [nearWidth/2, -nearHeight/2, -nearPlane],
    
    // 원거리 평면 (far plane)
    farTopLeft: [-farWidth/2, farHeight/2, -farPlane],
    farTopRight: [farWidth/2, farHeight/2, -farPlane],
    farBottomLeft: [-farWidth/2, -farHeight/2, -farPlane],
    farBottomRight: [farWidth/2, -farHeight/2, -farPlane]
  };
};

/**
 * FOV 시각화를 위한 선 정보 생성
 * @param {object} vertices - 프러스텀 꼭지점 좌표
 * @returns {array} 선분 정보 ([시작점, 끝점] 배열)
 */
export const createFrustumLines = (vertices) => {
  return [
    // 근거리 평면 (사각형)
    [vertices.nearTopLeft, vertices.nearTopRight],
    [vertices.nearTopRight, vertices.nearBottomRight],
    [vertices.nearBottomRight, vertices.nearBottomLeft],
    [vertices.nearBottomLeft, vertices.nearTopLeft],
    
    // 원거리 평면 (사각형)
    [vertices.farTopLeft, vertices.farTopRight],
    [vertices.farTopRight, vertices.farBottomRight],
    [vertices.farBottomRight, vertices.farBottomLeft],
    [vertices.farBottomLeft, vertices.farTopLeft],
    
    // 근거리 평면과 원거리 평면을 연결하는 선
    [vertices.nearTopLeft, vertices.farTopLeft],
    [vertices.nearTopRight, vertices.farTopRight],
    [vertices.nearBottomLeft, vertices.farBottomLeft],
    [vertices.nearBottomRight, vertices.farBottomRight]
  ];
}; 