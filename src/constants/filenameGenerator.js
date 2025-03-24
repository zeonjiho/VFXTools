export const MAX_PRESETS = Number.MAX_SAFE_INTEGER;

export const DEFAULT_FORM_FIELDS = {
  projectName: '',
  product: '',
  cutName: '',
  colorspace: 'srgb',
  xResolution: '',
  yResolution: '',
  productType: 'cgi',
  founder: '',
  versionState: 'prev',
  version: 1,
  frameNumberLength: 4
};

export const DEFAULT_CHECKBOX_STATES = {
  includeProjectName: true,
  includeProduct: true,
  includeCutName: true,
  includeColorspace: true,
  includeResolution: true,
  includeProductType: true,
  includeFounder: false,
  includeVersionState: true,
  includeVersion: true,
  includeFrameNumber: false
};

export const OPTIONAL_FIELDS = [
  { id: 'includeColorspace', label: 'Color Space' },
  { id: 'includeResolution', label: 'Resolution' },
  { id: 'includeProductType', label: 'Product Type' },
  { id: 'includeFounder', label: 'Founder' },
  { id: 'includeVersionState', label: 'Version State' },
  { id: 'includeVersion', label: 'Version' },
  { id: 'includeFrameNumber', label: 'Frame Number Length' }
];

export const COLORSPACE_OPTIONS = [
  { value: 'srgb', label: 'sRGB' },
  { value: 'rec709', label: 'Rec. 709' },
  { value: 'acescg', label: 'ACEScg' },
  { value: 'ap0', label: 'AP0' },
  { value: 'ap1', label: 'AP1' },
  { value: 'dcip3', label: 'DCI-P3' },
  { value: 'logC3', label: 'ARRI LogC3' },
  { value: 'logC4', label: 'ARRI LogC4' },
  { value: 'slog3', label: 'Sony S-Log3 - S-Gamut3' },
  { value: 'slog3-V-Cine', label: 'Sony S-Log3 - S-Gamut3.Cine' },
  { value: 'redwide', label: 'REDWideGamutRGB' },
  { value: 'REDLog3G10', label: 'Red Log3G10' },
  { value: 'linear', label: 'Linear' },
  { value: 'raw', label: 'Raw' }
];

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'cgi', label: 'CGI' },
  { value: 'comp', label: 'Comp' },
  { value: 'ai', label: 'AI' }
];

export const VERSION_STATE_OPTIONS = [
  { value: 'prev', label: 'Preview' },
  { value: 'final', label: 'Final' }
]; 