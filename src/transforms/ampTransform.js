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
const fs = require('fs');
const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const log = require('@ampproject/toolbox-core').log.tag('Runtime Download');
const AmpConfig = require('../helpers/AmpConfig');
const fetchRuntimeParams = require('@ampproject/toolbox-optimizer/lib/fetchRuntimeParameters');

const fetchRuntime = require('@ampproject/toolbox-runtime-fetch');

const ampTransform = (eleventyConfig, providedOptions = {}) => {
  const options = AmpConfig(providedOptions);
  const ampOptimizer = AmpOptimizer.create(options);
  const optimizerParamsPromise = maybeDownloadAmpRuntime(ampOptimizer.config);

  eleventyConfig.addTransform(options.key || 'amp', async (content, outputPath) => {
    if (!options.isAmp(outputPath)) {
      return content;
    }
    return ampOptimizer.transformHtml(content, await optimizerParamsPromise);
  });
};

async function maybeDownloadAmpRuntime(optimizerConfig) {
  if (!optimizerConfig.downloadAmpRuntime) {
    return {};
  }
  if (!optimizerConfig.ampRuntimeHost) {
    log.error('downloadAmpRuntime options requires ampRuntimeHost to be configured as well.');
    return {};
  }
  const runtimeParams = await fetchRuntimeParams(optimizerConfig);
  const ampRuntimePath = path.join('/rtv', runtimeParams.ampRuntimeVersion);
  runtimeParams.ampUrlPrefix = createAmpUrlPrefix(optimizerConfig, ampRuntimePath);
  downloadRuntime(runtimeParams.ampRuntimeVersion, optimizerConfig.dir.output, ampRuntimePath);
  return runtimeParams;
}

function createAmpUrlPrefix(optimizerConfig, ampRuntimePath) {
  return new URL(
    path.join(optimizerConfig.pathPrefix, ampRuntimePath),
    optimizerConfig.ampRuntimeHost
  ).toString();
}

async function downloadRuntime(ampRuntimeVersion, ouputDir, ampUrlPrefix) {
  const targetDir = path.join(ouputDir, ampUrlPrefix);
  if (fs.existsSync(targetDir)) {
    // runtime already downloaded
    return;
  }
  fetchRuntime.getRuntime({
    rtv: ampRuntimeVersion,
    dest: ouputDir,
  });
}
module.exports = ampTransform;
