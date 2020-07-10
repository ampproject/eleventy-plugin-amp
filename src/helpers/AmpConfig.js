const path = require('path');
const ImageOptimizer = require('./ImageOptimizer');

const AmpConfig = (providedOptions) => {
  const defaultOptions = {
    filter: /.*/,
    optimizeImages: true,
    dir: {
      output: '_site',
    },
    pathPrefix: '',
    workingDir: path.resolve('.'),
  };

  const options = Object.assign(defaultOptions, providedOptions);

  try {
    options.filter = new RegExp(options.filter);
  } catch (e) {
    throw new Error(`filter needs to be a valid RegExp, provided : ${options.filter}`);
  }

  options.isAmp = (path) => path.endsWith('.html') && options.filter.test(path);

  if (providedOptions.optimizeImages !== false && !providedOptions.imageOptimizer) {
    options.imageOptimizer = ImageOptimizer.create(options);
  }

  return options;
};

module.exports = AmpConfig;
