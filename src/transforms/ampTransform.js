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
const collectCss = require('../helpers/collectCss');
const processOptions = require('../helpers/processOptions');

const ampTransform = (eleventyConfig, providedOptions = {}) => {
  const options = processOptions(providedOptions);

  const ampOptimizer = createAmpOptimizer(options);

  eleventyConfig.addTransform('amp', async (content, outputPath) => {
    if (!options.isAmp(outputPath)) {
      return content;
    }
    const amphtml = await ampOptimizer.transformHtml(content, {
      outputPath,
    });
    return amphtml;
  });
};

function createAmpOptimizer(options) {
  // support the markdown image syntax
  options.markdown = true;
  // add CSS collector
  options.transformations = [
    collectCss,
    // allow custom transformations via options
    ...(options.transformations || AmpOptimizer.TRANSFORMATIONS_AMP_FIRST),
  ];
  return AmpOptimizer.create(options);
}

module.exports = ampTransform;
