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

const minifyCss = require('./minifyCss');
const {appendChild, insertText, createElement, nextNode, firstChildByTag, remove} =
  require('@ampproject/toolbox-optimizer').NodeUtils;

class CollectCss {
  constructor(config) {
    this.minifyCss = config.minifyCss !== false;
  }
  transform(root) {
    if (!this.minifyCss) {
      return;
    }
    const html = firstChildByTag(root, 'html');
    if (!html) {
      return;
    }
    const head = firstChildByTag(html, 'head');
    if (!head) {
      return;
    }
    const cssNodes = this.collectCssNodes(root);
    const css = this.mergeCss(cssNodes);
    cssNodes.forEach(remove);
    const ampCustom = this.createAmpCustomNode(css);
    appendChild(head, ampCustom);
  }

  createAmpCustomNode(css, head) {
    const ampCustom = createElement('style', {'amp-custom': ''});
    insertText(ampCustom, css);
    return ampCustom;
  }

  collectCssNodes(root) {
    const cssNodes = [];
    let node = root;
    while (node) {
      if (
        node.tagName === 'style' &&
        (Object.keys(node.attribs).length === 0 || node.attribs['amp-custom'] !== undefined)
      ) {
        cssNodes.push(node);
      }
      node = nextNode(node);
    }
    return cssNodes;
  }

  mergeCss(cssNodes) {
    const cssStrings = new Set();
    for (const cssNode of cssNodes) {
      for (const child of cssNode.children) {
        if (!child.type === 'text') {
          continue;
        }
        cssStrings.add(child.data);
      }
    }

    let css = Array.from(cssStrings).join('\n');
    if (this.minifyCss) {
      css = minifyCss(css);
    }
    return css;
  }
}

module.exports = CollectCss;
