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

const ampDisableCacheTransform = require('./ampDisableCacheTransform');
const AmpConfig = require('../helpers/AmpConfig');

let options;
let key;
let transform;

let testConfig;

beforeEach(() => {
  options = AmpConfig({});
  testConfig = {
    addTransform: (k, t) => {
      key = k;
      transform = t;
    },
  };
});

test('disabled by default', async () => {
  ampDisableCacheTransform(testConfig, options);
  expect(transform).toBe(undefined);
});

test('removes the `amp` attribute', async () => {
  options.ampCache = false;
  ampDisableCacheTransform(testConfig, options);
  const content = '<html amp><head></head></html>';
  const transformedContent = await transform(content, 'test.html');
  expect(transformedContent).toEqual('<html><head></head></html>');
});

test('removes the `⚡` attribute', async () => {
  options.ampCache = false;
  ampDisableCacheTransform(testConfig, options);
  const content = '<html ⚡><head></head></html>';
  const transformedContent = await transform(content, 'test.html');
  expect(transformedContent).toEqual('<html><head></head></html>');
});
