'use strict';

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports.createTemplateWebpackConfig = function(options) {
    const isTest = options.isTest || false;
    const isProd = options.isProd || false;

    const requiredOptions = [
        'dirname',
        'libraryName',
    ]

    requiredOptions.forEach((option) => {
        if (!option in options) {
            throw new Error(`${option} option is required in options`);
        }
    });

    const outputPath = options.outputPath || options.dirname + '/dist';

    const provideJquery = options.provideJquery || false;

    const extraCommandsOnBuildEnd = options.extraCommandsOnBuildEnd || [];

    const extraRules = options.extraRules || [];

    const extraPlugins = options.extraPlugins || [];

    const extractStyles = options.extractStyles || false;

    const resolveAngular = options.resolveAngular || false;

    const supplyBaseExternals = options.supplyBaseExternals || false;

    var config = {};

    if (isProd) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }

    config.entry = options.entry;

    config.output = isTest ? {} : {
        path: outputPath,
        filename: '[name].js',
        library: options.libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: "(typeof self !== 'undefined' ? self : this)",
    };

    config.optimization = {
        minimize: isProd,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    keep_classnames: true
                }
            }),
        ],
    };

    if (isTest) {
        config.devtool = 'inline-source-map';
    } else {
        config.devtool = 'source-map';
    }

    config.plugins = [];

    var cssExtractLoader = [];

    if (extractStyles) {
        config.plugins.push(new FixStyleOnlyEntriesPlugin());
        config.plugins.push(new MiniCssExtractPlugin({
            filename: 'styles.css',
        }));

        cssExtractLoader = [{
            loader: MiniCssExtractPlugin.loader,
                options: {
                    hmr: process.env.NODE_ENV === 'development',
                },
            }
        ];
    }

    config.plugins = config.plugins.concat(extraPlugins);

    if (provideJquery) {
        config.plugins.push(new webpack.ProvidePlugin({
            "window.jQuery": "jquery",
            "$": "jquery",
        }));
    }

    if (extraCommandsOnBuildEnd.length > 0) {
        if (!isTest) {
            config.plugins.push(new WebpackShellPlugin({
                onBuildEnd:extraCommandsOnBuildEnd
            }));
        }
    }

    if (!isTest && !supplyBaseExternals) {
        config.externals = [
            '@uirouter/angularjs',
            'angular',
            'angular-animate',
            'angular-ui-bootstrap',
            'buildbot-data-js',
            'd3',
            'guanlecoja-ui',
            'jquery',
        ];
    }

    config.module = {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.jade$/,
            loader: 'pug-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: [
                ...cssExtractLoader,
                'css-loader',
            ],
        }, {
            test: /\.less$/,
            use: [
                ...cssExtractLoader,
                'css-loader',
                'less-loader',
                'import-glob-loader',
            ],
        }, 
        // {
        //     test: /\.(png|jpe?g)$/,
        //     use: [
        //       {
        //         loader: 'file-loader',
        //         options: {},
        //       },
        //     ],
        // },
        ...extraRules
    ]};

    // avoid duplicate load of angular in tests
    if (resolveAngular && isTest) {
        config.resolve = {
            alias: {
              'angular': path.resolve(path.join(__dirname, 'node_modules', 'angular'))
            },
        };
    }

    return config;
};
