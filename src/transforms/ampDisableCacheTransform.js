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
const AmpConfig = require('../helpers/AmpConfig');
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
const ampDisableCacheTransform = async (eleventyConfig, providedOptions = {}) => {
  const options = AmpConfig(providedOptions);
  const availableRuntimes = new Set();

  if (options.ampCache !== false) {
    return;
  }

  /**
   * A custom transformer that detects the used AMP runtime version and triggers the AMP runtime download.
   */
  class DownloadRuntime {
    constructor(config) {
      this.log = config.log;
      if (!options.host) {
        this.log.warn('Cannot self-host the AMP runtime as `host` option is not specified.');
      }
    }
    async transform(root, params) {
      if (!options.host) {
        // host needs to be specified to be able to self-host the AMP runtime
        return;
      }
      const outputDir = options.dir.output;
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

        const ampUrlPrefix = path.join('/rtv', ampRuntimeVersion);
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
        params.ampUrlPrefix = new URL(
          path.join(options.pathPrefix, ampUrlPrefix),
          options.host
        ).toString();
      }
    }

    async downloadRuntime(ampRuntimeVersion, ouputDir, ampUrlPrefix) {
      if (availableRuntimes.has(ampRuntimeVersion)) {
        return true;
      }
      const targetDir = path.join(ouputDir, ampUrlPrefix);
      if (fs.existsSync(targetDir)) {
        availableRuntimes.add(ampRuntimeVersion);
        return true;
      }
      // Create dir to avoid triggering multiple downloads
      fs.mkdirSync(targetDir, {recursive: true});
      const status = fetchRuntime.getRuntime({
        rtv: ampRuntimeVersion,
        dest: ouputDir,
      }).status;
      if (status) {
        availableRuntimes.add(ampRuntimeVersion);
      }
      return status;
    }
  }

  const ampOptimizer = AmpOptimizer.create({
    transformations: [DownloadRuntime, 'RemoveAmpAttribute', 'RewriteAmpUrls'],
  });
  eleventyConfig.addTransform('amp-disable-cache', async (content, outputPath) => {
    if (!options.isAmp(outputPath)) {
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
