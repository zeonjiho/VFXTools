export const generateFilename = (formFields, checkboxStates) => {
  const { projectName, product, cutName, founder, colorspace, xResolution, yResolution,
          productType, versionState, version, frameNumberLength } = formFields;
  
  // founder 필드 검증 (영어만 허용)
  if (founder && !/^[A-Za-z ]+$/.test(founder)) {
    throw new Error('Founder 필드에는 영어만 입력 가능합니다.');
  }

  // 버전 번호 포맷팅
  const versionFormatted = 'v' + ('000' + version).slice(-3);

  // 프레임 번호 자리수
  let framePlaceholder = '';
  if (checkboxStates.includeFrameNumber) {
    framePlaceholder = '.' + '#'.repeat(frameNumberLength);
  }

  const fields = [];

  // 항상 포함되는 필드
  fields.push(projectName);
  fields.push(product);
  fields.push(cutName);

  // 체크박스에 따른 필드 추가
  if (checkboxStates.includeColorspace) {
    fields.push(colorspace);
  }

  if (checkboxStates.includeResolution) {
    let resolution = '';
    if (xResolution && yResolution) {
      resolution = xResolution + 'x' + yResolution;
    } else if (xResolution) {
      resolution = xResolution;
    } else if (yResolution) {
      resolution = yResolution;
    }

    if (resolution) {
      fields.push(resolution);
    }
  }

  if (checkboxStates.includeProductType) {
    fields.push(productType);
  }

  if (checkboxStates.includeFounder) {
    const trimmedFounder = founder.trim();
    if (trimmedFounder) {
      fields.push(trimmedFounder);
    }
  }

  if (checkboxStates.includeVersionState) {
    fields.push(versionState);
  }

  if (checkboxStates.includeVersion) {
    fields.push(versionFormatted);
  }

  return fields.join('_') + framePlaceholder;
}; 