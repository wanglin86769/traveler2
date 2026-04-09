/**
 * Configuration Index
 * Centralized export for all configuration files
 */

import { IMAGE_UPLOAD_CONFIG } from './imageUpload'
import { FILE_UPLOAD_CONFIG } from './fileUpload'

export { IMAGE_UPLOAD_CONFIG, FILE_UPLOAD_CONFIG }

export const CONFIG = {
  IMAGE_UPLOAD: IMAGE_UPLOAD_CONFIG,
  FILE_UPLOAD: FILE_UPLOAD_CONFIG
}