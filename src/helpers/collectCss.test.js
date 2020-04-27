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

const CollectCss = require('./collectCss');
const prettier = require('prettier');
const format = (string) => prettier.format(string, {parser: 'html'});

const AmpOptimizer = require('@ampproject/toolbox-optimizer');

test('merges styles', async () => {
  const ampOptimizer = createAmpOptimizer();
  const html = `
  <html>
    <head>
      <style>
        a {
          color: blue;
        }
      </style>
    </head>
    <body>
      <style>
        b {
          color: red;
        }
      </style>
      <div>
        <style>
          b {
            color: red;
          }
        </style>
      </div>
    </body>
  </html>
  `;
  const amphtml = await ampOptimizer.transformHtml(html);
  expect(format(amphtml)).toEqual(
    format(`
       <html>
        <head>
          <style amp-custom>a{color:#00f}b{color:red}b{color:red}</style></head>
        <body>
          <div>
          </div>
        </body>
      </html>
  `)
  );
});

test('minification can be disabled', async () => {
  const ampOptimizer = createAmpOptimizer({minifyCss: false});
  const html = `
  <html>
    <head>
      <style>
        a {
          color: blue;
        }
      </style>
    </head>
  </html>
  `;
  const amphtml = await ampOptimizer.transformHtml(html);
  expect(format(amphtml)).toEqual(
    format(`
       <html>
        <head>
          <style>
            a {
              color: blue;
            }
          </style>
        </head>
      </html>
  `)
  );
});

function createAmpOptimizer(options = {}) {
  options.transformations = [CollectCss];
  return AmpOptimizer.create(options);
}
