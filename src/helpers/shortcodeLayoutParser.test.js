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

const {extractLayoutString, extractLayout} = require('./shortcodeLayoutParser');

test('return default layout if no args given', () => {
  const defaultLayout = {
    layout: 'fill',
  };
  expect(extractLayout([], defaultLayout)).toEqual(defaultLayout);
});

test('returns fixed layout with dimensions', () => {
  expect(extractLayout([300, 200], 'responsive')).toEqual({
    layout: 'fixed',
    width: 300,
    height: 200,
  });
});

test('returns layout with dimensions', () => {
  expect(extractLayout(['responsive', 300, 200])).toEqual({
    layout: 'responsive',
    width: 300,
    height: 200,
  });
});

test('supports layouts without additional parameters', () => {
  expect(extractLayout(['fill'])).toEqual({
    layout: 'fill',
  });
});

test('fails on single argument that is not layout or height', () => {
  const t = () => extractLayout(['test']);
  expect(t).toThrow(Error);
});

test('supports fixed-height layout with height', () => {
  expect(extractLayout(['fixed-height', 300])).toEqual({
    layout: 'fixed-height',
    height: 300,
  });
});

test('uses fixed-height layout if only height given', () => {
  expect(extractLayout([300])).toEqual({
    layout: 'fixed-height',
    height: 300,
  });
});

test('validates layout', () => {
  const t = () => extractLayout(['invalid', 300, 200]);
  expect(t).toThrow(Error);
});

test('fails if layout cannot be detected', () => {
  const t = () => extractLayout(['responsive', 300, 200, 23234]);
  expect(t).toThrow(Error);
});

test('converts layout to string', () => {
  expect(extractLayoutString(['intrinsic', 300, 200])).toBe(
    'layout="intrinsic" width="300" height="200"'
  );
});
