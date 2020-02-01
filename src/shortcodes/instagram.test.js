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

const ampInstagram = require('./instagram');
const {expectShortcode} = require('../helpers/testHelpers');

test('instagram defaults to square', () => {
  expectShortcode(ampInstagram(1234567)).toBe(`
    <amp-instagram data-shortcode="1234567" layout="responsive" width="1" height="1"></amp-instagram>
  `);
});

test('instagram with intrinsic layout', () => {
  expectShortcode(ampInstagram(1234567, 'intrinsic', 300, 200)).toBe(`
    <amp-instagram data-shortcode="1234567" layout="intrinsic" width="300" height="200"></amp-instagram>
  `);
});

test('fails if too few arguments', () => {
  expect(() => ampInstagram()).toThrow();
});
