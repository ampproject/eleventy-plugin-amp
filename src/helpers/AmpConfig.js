const path = require('path');
const ImageOptimizer = require('./ImageOptimizer');
const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const collectCss = require('../helpers/collectCss');

const AmpConfig = (providedOptions) => {
  const defaultOptions = {
    dir: {
      output: '_site',
    },
    filter: /.*/,
    optimizeImages: true,
    pathPrefix: '',
    workingDir: path.resolve('.'),
    // support the markdown image syntax
    markdown: true,
    // add CSS collector
    transformations: [
      collectCss,
      // allow custom transformations via options
      ...(providedOptions.transformations || AmpOptimizer.TRANSFORMATIONS_AMP_FIRST),
    ],
  };

  const options = Object.assign(defaultOptions, providedOptions);

  try {
    options.filter = new RegExp(options.filter);
  } catch (e) {
    throw new Error(`filter needs to be a valid RegExp, provided : ${options.filter}`);
  }

  options.isAmp = (path) => path && path.endsWith('.html') && options.filter.test(path);

  if (providedOptions.optimizeImages !== false && !providedOptions.imageOptimizer) {
    options.imageOptimizer = ImageOptimizer.create(options);
  }

  return options;
};

module.exports = AmpConfig;
