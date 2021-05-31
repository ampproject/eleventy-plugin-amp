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
const AmpConfig = require('./AmpConfig');

const SUPPORTED_FORMATS = new Set([
  'avif',
  'heic',
  'heif',
  'jpeg',
  'jpg',
  'png',
  'raw',
  'tiff',
  'webp',
]);
const DEFAULT_FORMAT = 'jpeg';

const DEFAULT_URL_PATH = '/img/';

/**
 * See https://github.com/11ty/eleventy-img#options-list for supported options.
 *
 * @param {Object} opts - options for eleventy-img
 */
const createImageOptimizer = (config = {}) => {
  if (!config.imageOptimization) {
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
      const opts = Object.assign({}, config, {
        urlPath: config.imageOptimization.urlPath || DEFAULT_URL_PATH,
        cacheOptions: config.imageOptimization.cacheOptions,
        formats: Array.from(new Set([format, ...(config.imageOptimization.formats || [])])),
        widths: [width],
      });
      opts.outputDir = path.join(config.dir.output, opts.urlPath);
      if (!isAbsoluteUrl(src)) {
        src = resolveImageOnFileSystem(config, src);
      }
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

function resolveImageOnFileSystem(config, src) {
  if (typeof config.imageBasePath == 'function') {
    return config.imageBasePath(src);
  }
  if (typeof config.imageBasePath == 'string') {
    return path.join(config.imageBasePath, src);
  }
  return path.join(config.workingDir, src);
}

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
  // Normalize to jpeg
  if (fileExtension === 'jpg') {
    fileExtension = 'jpeg';
  }
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
