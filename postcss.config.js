module.exports = {
  plugins: [
    require('autoprefixer')({
      'browsers': ['cover 99%']
    }),
    require('cssnano')({
      preset: 'default',
    }),
  ]
}