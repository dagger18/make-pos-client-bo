module.exports = {
  input: {
    path: './src',
    include: ['**/*.vue', '**/*.js', '**/*.ts'],
  },
  output: {
    path: './src/locales',
    potPath: './messages.pot',
    locales: ['zh', 'vi', 'ja', 'ko', 'de', 'es', 'ar'],
    flat: true,
    splitLocaleFiles: false,
    compiledLocalesPath: './public/locales',
  },
}
