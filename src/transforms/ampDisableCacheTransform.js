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
const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const fetchRuntime = require('@ampproject/toolbox-runtime-fetch');
const fs = require('fs');
const path = require('path');
const {hasAttribute, firstChildByTag} = require('@ampproject/toolbox-optimizer/lib/NodeUtils');

/**
 * Removes the `amp` attribute from the `html` tag to disable serving
 * the page from the AMP Cache. We do this in a separate transformer
 * to still support AMP validation. This will also download and self-host
 * the complete AMP runtime.
 *
 * Note: amp-geo won't work in this mode as it's an AMP Cache feature.
 * See https://github.com/ampproject/amphtml/blob/master/spec/amp-framework-hosting.md#amp-geo-fallback-api
 */
const ampDisableCacheTransform = async (eleventyConfig, options = {}) => {
  if (options.ampCache !== false) {
    return;
  }

  /**
   * A custom transformer that detects the used AMP runtime version and triggers the AMP runtime download.
   */
  class DownloadRuntime {
    constructor(config) {
      this.log = config.log;
    }
    async transform(root, params) {
      const outputDir = options.ampRuntimeDir || '_site';
      const html = firstChildByTag(root, 'html');
      const head = firstChildByTag(html, 'head');
      for (const node of head.children) {
        if (node.tagName !== 'style') {
          continue;
        }
        if (!hasAttribute(node, 'amp-runtime')) {
          continue;
        }
        const ampRuntimeVersion = node.attribs['i-amphtml-version'];
        if (!ampRuntimeVersion) {
          continue;
        }

        const ampUrlPrefix = path.join('rtv', ampRuntimeVersion);
        const downloadSuccess = await this.downloadRuntime(
          ampRuntimeVersion,
          outputDir,
          ampUrlPrefix
        );
        if (!downloadSuccess) {
          this.log.warn('Failed downloading AMP runtime.');
          return;
        }
        // Runtime has been successfully downloaded, update params
        // to rewrite the script import URLs in subsequent transformations
        params.ampRuntimeVersion = ampRuntimeVersion;
        params.ampUrlPrefix = ampUrlPrefix;
      }
    }

    async downloadRuntime(ampRuntimeVersion, ouputDir, runtimeDir) {
      const targetDir = path.join(ouputDir, runtimeDir);
      if (fs.existsSync(targetDir)) {
        return true;
      }
      this.log.info('Downloading AMP runtime version', ampRuntimeVersion);
      return fetchRuntime.getRuntime({
        dest: ouputDir,
      }).status;
    }
  }

  const ampOptimizer = AmpOptimizer.create({
    transformations: [DownloadRuntime, 'RemoveAmpAttribute', 'RewriteAmpUrls'],
  });
  eleventyConfig.addTransform('amp-disable-cache', async (content, outputPath) => {
    if (!outputPath.endsWith('.html')) {
      return content;
    }
    const amphtml = await ampOptimizer.transformHtml(content, {
      outputPath,
      ampRuntimeStyles: '',
      // it's OK to enable ESM as we're publishing invalid AMP anyway (this will be valid AMP in the future)
      experimentEsm: true,
    });
    return amphtml;
  });
};

module.exports = ampDisableCacheTransform;
