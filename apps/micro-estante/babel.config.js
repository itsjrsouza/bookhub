module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { esmodules: true } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    // Permite importar o pacote @bookhub/shared (escrito em TS) direto da
    // fonte — o Babel aqui só remove as anotações de tipo, sem checá-las
    // (este micro continua sendo JavaScript puro, como pede o enunciado).
    '@babel/preset-typescript',
  ],
};
