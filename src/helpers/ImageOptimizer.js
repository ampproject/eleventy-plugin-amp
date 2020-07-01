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

const log = require('@ampproject/toolbox-core').log.tag('AMP Img Optimization');
const path = require('path');
const Image = require('@11ty/eleventy-img');

const SUPPORTED_FORMATS = new Set(['heic', 'heif', 'jpeg', 'jpg', 'png', 'raw', 'tiff', 'webp']);
const DEFAULT_FORMAT = 'jpeg';

const WORKING_DIR = path.resolve('.');
const DEFAULT_OUTPUT_DIR = '_site';
const DEFAULT_URL_PATH = '/img/';

/**
 * See https://github.com/11ty/eleventy-img#options-list for supported options.
 *
 * @param {Object} opts - options for eleventy-img
 */
const createImageOptimizer = (globalOpts) => {
  if (!globalOpts.imageOptimization) {
    // don't optimize images
    return;
  }
  /**
   * Resizes the image specified at the given src URL to the given width. Images
   * specified via an absolute URL will be downloaded and cached locally.
   *
   * @param {string} src - the original img's src URL
   * @param {number} width  - the target width
   */
  return async (src, width) => {
    const format = extractImageFormat(src);
    try {
      // Resize and compress the image (and download if needed).
      const opts = Object.assign({}, globalOpts, {
        outputDir: globalOpts.imageOptimization.outputDir || DEFAULT_OUTPUT_DIR,
        urlPath: globalOpts.imageOptimization.urlPath || DEFAULT_URL_PATH,
        cacheDuration: globalOpts.imageOptimization.cacheDuration,
        formats: Array.from(new Set([format, ...(globalOpts.formats || [])])),
        widths: [width],
      });
      if (!isAbsoluteUrl(src)) {
        src = path.join(WORKING_DIR, src);
      }
      opts.outputDir = path.join(opts.outputDir, opts.urlPath);
      const stats = await Image(src, opts);
      const srcForWidth = stats[format][0].url;
      return srcForWidth;
    } catch (e) {
      log.warn(`Could not optimize image (${src}, ${width}w):`, e);
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
    log.error('Image src is not a valid URL', src);
    return DEFAULT_FORMAT;
  }
  let fileExtension = path.extname(srcPath);
  if (!fileExtension) {
    return DEFAULT_FORMAT;
  }
  fileExtension = fileExtension.substring(1).toLowerCase();
  if (!SUPPORTED_FORMATS.has(fileExtension)) {
    return DEFAULT_FORMAT;
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
