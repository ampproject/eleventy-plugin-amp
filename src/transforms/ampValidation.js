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

const toolboxLog = require('@ampproject/toolbox-core').log.tag('AMP Validation');
const amphtmlValidator = require('amphtml-validator');
const processOptions = require('../helpers/processOptions')

const ampValidationTransform = (eleventyConfig, providedOptions = {}) => {

  const options = processOptions(providedOptions);

  if (options.validation === false) {
    return;
  }
  const log = options.log || toolboxLog;
  eleventyConfig.addTransform('amp-validation', async (content, outputPath) => {
    if (!outputPath.endsWith('.html') || !options.filter.test(outputPath)) {
      return content;
    }
    const result = await validate(content);
    if (result.status === 'PASS') {
      log.success(`${outputPath} [${result.status}]`);
    } else {
      log.error(`${outputPath} [${result.status}]`);
    }
    for (const error of result.errors) {
      log.info(createErrorMessage(error, outputPath));
    }
    return content;
  });
};

async function validate(content) {
  const validatorInstance = await amphtmlValidator.getInstance();
  const result = validatorInstance.validateString(content);
  return result;
}

function createErrorMessage(error, outputPath) {
  let msg = `${error.severity}: ${error.message}`;
  if (error.specUrl) {
    msg += ' (see ' + error.specUrl + ')';
  }
  msg += `\n    at ${outputPath}:${error.line}:${error.col}`;
  return msg;
}

module.exports = ampValidationTransform;
