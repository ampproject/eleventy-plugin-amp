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

const {extractLayoutString} = require('../helpers/shortcodeLayoutParser');

// Assume default aspect ratio to be 1:1 (responsive layout takes care of sizing)
const DEFAULT_LAYOUT = {
  layout: 'responsive',
  width: 1,
  height: 1,
};

module.exports = (...args) => {
  if (args.length == 0) {
    throw new Error('Missing instagram id');
  }
  const id = args[0];
  const layout = extractLayoutString(args.splice(1), DEFAULT_LAYOUT);
  return `<amp-instagram data-shortcode="${id}" ${layout}></amp-instagram>`;
};
