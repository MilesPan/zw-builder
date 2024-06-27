# 开发调试
```shell
npm link 
npm unlink zw-builder -g
```
# 使用前提
项目和dist项目需在同一文件夹内，并且项目名字得是原始的,理论上ec和manage都可以使用.

# 使用
```shell
npm i -g zw-builder
```

运行前先检查webpack.base.conf.js文件中eslint-loader的配置，将failOnError设置为true，否则一些很明显的语法错误，依然会打包通过。

在任意项目的根目录下运行 

```shell
zw-builder