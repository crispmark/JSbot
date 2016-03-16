module.exports = {
  entry: [__dirname + '/mainPage.js', __dirname + '/script.js'],
  output: {
    filename: __dirname + '/public/compiled/app-bundle.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'sourcemap'
}
