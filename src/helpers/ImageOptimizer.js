/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const Image = require('@11ty/eleventy-img');

const SUPPORTED_FORMATS = new Set(['heic', 'heif', 'jpeg', 'jpg', 'png', 'raw', 'tiff', 'webp']);

/**
 * See https://github.com/11ty/eleventy-img#options-list for supported options.
 *
 * @param {Object} opts - options for eleventy-img
 */
const createImageOptimizer = (globalOpts) => {
  /**
   * Resizes the image specified at the given src URL to the given width. Images
   * specified via an absolute URL will be downloaded and cached locally.
   *
   * @param {string} src - the original img's src URL
   * @param {number} width  - the target width
   */
  return async (src, width) => {
    const format = extractImageFormat(src);
    if (!format) {
      // Don't convert images with unknown format
      return null;
    }
    try {
      // Resizes, compresses the image (and download if needed).
      const opts = Object.assign({}, globalOpts, {
        formats: [format, ...(globalOpts.formats || [])],
        widths: [width],
      });
      if (!isAbsoluteUrl(src)) {
        // Not sure if using the process root is the correct approach
        src = path.join(process.cwd(), src);
      }
      const stats = await Image(src, opts);
      return stats[format][0].url;
    } catch (e) {
      console.log(`Could not optimize image (${src}, ${width}w):`, e);
      // Don't generate a srcset entry for this image / width.
      return null;
    }
  };
};

function extractImageFormat(src) {
  let srcPath;
  try {
    // remove potential query parameters
    srcPath = new URL(src, 'https://example.com').pathname;
  } catch (e) {
    console.error('Image src is not a valid URL', src);
    return null;
  }
  let fileExtension = path.extname(srcPath);
  if (!fileExtension) {
    return null;
  }
  fileExtension = fileExtension.substring(1).toLowerCase();
  if (!SUPPORTED_FORMATS.has(fileExtension)) {
    return null;
  }
  return fileExtension;
}

function isAbsoluteUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (ex) {}

  return false;
}

module.exports = {create: createImageOptimizer};
