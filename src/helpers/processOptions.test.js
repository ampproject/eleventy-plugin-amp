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

const processOptions = require('./processOptions');

test('returns an object with expected default properties', () => {
  const processedOutput = processOptions({})

  expect(processedOutput.filter).toBeTruthy()
  expect(typeof processedOutput.isAmp).toBe('function')
});

test('.filter prop is a vaild RegExp', () => {
  expect(processOptions({}).filter instanceof RegExp).toBeTruthy()
});

test('throws if you pass an non valid RegExp to .filter', () => {
  expect(() => processOptions({filter: '?'})).toThrow(/filter needs to be a valid RegExp/)
});

test('provides .isAmp function to match the filter RegExp on html filenames', () => {
  expect(processOptions({}).isAmp('foo.js')).toBeFalsy()
  expect(processOptions({}).isAmp('foo.html')).toBeTruthy()
  expect(processOptions({filter: '^notFoo'}).isAmp('foo.html')).toBeFalsy()
});
