import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import { badRequest } from '../utils/httpError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXT_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // Random file names: never trust the uploaded name.
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXT_BY_TYPE[file.mimetype]}`),
})

export const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (EXT_BY_TYPE[file.mimetype]) cb(null, true)
    else cb(badRequest('Only JPG, PNG, WEBP or AVIF images are allowed'))
  },
}).array('images', 8)
