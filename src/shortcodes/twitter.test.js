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

const ampTwitter = require('./twitter');
const {expectShortcode} = require('../helpers/testHelpers');

test('tweet with intrinsic layout', () => {
  expectShortcode(ampTwitter(1234567, 'intrinsic', 300, 200)).toBe(`
    <amp-twitter data-tweetid="1234567" layout="intrinsic" width="300" height="200"></amp-twitter>
  `);
});

test('tweet with fixed-height layout', () => {
  expectShortcode(ampTwitter(1234567, 200)).toBe(`
    <amp-twitter data-tweetid="1234567" layout="fixed-height" height="200"></amp-twitter>
  `);
});

test('fails without layout', () => {
  expect(() => ampTwitter()).toThrow();
});
