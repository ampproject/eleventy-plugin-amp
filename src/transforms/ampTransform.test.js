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

let ampTransformer = require('./ampTransform');

let key;
let transform;

const testConfig = {
  addTransform: (k, t) => {
    key = k;
    transform = t;
  },
};

ampTransformer(testConfig);

test('registers amp transformer', () => {
  expect(key).toBe('amp');
});

test('ignores non-html files', async () => {
  const content = 'untransformed';
  const transformedContent = await transform(content, 'test.txt');
  expect(transformedContent).toBe('untransformed');
});

test('transforms html files', async () => {
  const content = '<h1>Hello World</h1>';
  const transformedContent = await transform(content, 'test.html');
  expect(transformedContent).toContain('<html');
});

test('only runs on files that match filter, when provided', async () => {
  // should only match filenames that contain "amp"
  ampTransformer(testConfig, {filter: /^.*amp.*$/});

  const content = '<h1>Hello World</h1>';
  const unmatchedTransformedContent = await transform(content, 'test.html');
  const matchedTransformedContent = await transform(content, 'test.amp.html');
  expect(unmatchedTransformedContent).toBe(content);
  expect(matchedTransformedContent).toContain('<html');
});
