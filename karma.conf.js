// Karma configuration
// Generated on Wed Aug 12 2015 15:51:14 GMT+0200 (CEST)

module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: ['jspm', 'jasmine'],

        jspm: {
            loadFiles: [
                'test/**/*.js'
            ],
            serveFiles: [
                'src/**/*.js',
                'node_modules/angular/*',
                'node_modules/angular-mocks/*'
            ]
        },

        exclude: [],

        reporters: ['progress', 'coverage'],


        port: 9876,

        colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['PhantomJS'],

        singleRun: false,

        plugins: ['karma-jspm', 'karma-phantomjs-launcher', 'karma-jasmine', 'karma-coverage', 'karma-babel-preprocessor'],

        preprocessors: {
            'test/(*spec).js': ['babel', 'coverage'],
            'src/!(*spec).js': ['babel', 'coverage']
        }
    });
}
