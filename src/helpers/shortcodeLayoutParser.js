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
const AMP_LAYOUTS = new Set([
  'nodisplay',
  'fixed',
  'responsive',
  'fixed-height',
  'fill',
  'container',
  'flex-item',
  'fluid',
  'intrinsic',
]);

const extractLayout = (args, defaultLayout = {}) => {
  if (!args || args.length === 0) {
    return defaultLayout;
  }
  // Single argument layouts such as fill or nodisplay
  if (args.length === 1) {
    if (AMP_LAYOUTS.has(args[0])) {
      // we don't need to check if the layout doesn't need params as
      // this is done by the AMP validator
      return {
        layout: args[0],
      };
    } else if (isLeadingNumber(args[0])) {
      return {
        layout: 'fixed-height',
        height: args[0],
      };
    } else {
      throw new Error(`Could not parse layout ${args}`);
    }
  }
  // Two args layouts such as fixed-height or fixed with dimension
  if (args.length === 2) {
    if (isLayout(args[0], 'fixed-height')) {
      return {
        layout: args[0],
        height: args[1],
      };
    }
    return {
      layout: 'fixed',
      width: args[0],
      height: args[1],
    };
  }
  if (args.length === 3) {
    const layout = assertValidLayout(args[0]);
    return {
      layout,
      width: args[1],
      height: args[2],
    };
  }
  throw new Error(`Unsupported layout ${args}`);
};

const extractLayoutString = (args, defaultLayout) => {
  const layout = extractLayout(args, defaultLayout);
  return Object.entries(layout)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
};

// used to detect 400px or 400vh
const isLeadingNumber = (obj) => {
  const leadingNumber = /(\d+(?:\.\d+)?)(.*)/;
  return leadingNumber.exec(obj);
};

const isLayout = (obj, layout) => obj && obj.toString().toLowerCase() === layout;

const assertValidLayout = (string) => {
  if (AMP_LAYOUTS.has(string.toLowerCase())) {
    return string;
  }
  throw new Error(`invalid layout definition: ${string}`);
};

module.exports = {
  extractLayoutString,
  extractLayout,
};
