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
const AmpConfig = require('../helpers/AmpConfig');
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
const ampDisableCacheTransform = (eleventyConfig, providedOptions = {}) => {
  const options = AmpConfig(providedOptions);
  if (options.ampCache !== false) {
    return;
  }

  const ampOptimizer = AmpOptimizer.create({
    transformations: ['RemoveAmpAttribute'],
  });
  eleventyConfig.addTransform('amp-disable-cache', (content, outputPath) => {
    if (!options.isAmp(outputPath)) {
      return content;
    }
    return ampOptimizer.transformHtml(content, {
      outputPath,
    });
  });
};

module.exports = ampDisableCacheTransform;
