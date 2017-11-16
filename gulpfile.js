var gulp = require('gulp'),
  notify = require("gulp-notify"),
  changed = require('gulp-changed'),
  concat = require('gulp-concat'),
  autoprefix = require('gulp-autoprefixer'),
  connect = require('gulp-connect'),
  inject = require('gulp-inject'),
  uglify = require('gulp-uglify'),
  del = require('del'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  nano = require('gulp-cssnano'),
  gutil = require('gulp-util'),
  rename = require("gulp-rename"),
  browserSync = require("browser-sync"),
  reload  = browserSync.reload,
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  cheerio = require('gulp-cheerio'),
  imagemin = require('gulp-imagemin'),
  jshint = require('gulp-jshint'),
  pkg = require('./package.json');

gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});

var reportError = function (error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Inspect the error object
    //console.log(error);

    // Easy error reporting
    //console.log(error.toString());

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
    if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}

gulp.task('clean', function () {
  return del([
    'assets/css/my_project.css',
    'assets/css/my_project.min.css',
    'assets/js/my_project.js',
    'assets/js/my_project.min.js'
  ]);
});

gulp.task('html', ['clean'], function () {
  var target = gulp.src('index.html');
  var sources = gulp.src(['./assets/js/' + pkg.name + '.js', './assets/css/' + pkg.name + '.css'], {read: false});
  
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./'))
    .pipe(connect.reload());
});

// JS hint task
gulp.task('jshint', function() {
  gulp.src('./assets/js/' + pkg.name + '.js')
    .pipe(jshint())
    .pipe(notify("Js Hinted..."))
    .pipe(jshint.reporter('default'));
});

// minify new images
gulp.task('imagemin', function() {
  var imgSrc = './assets/images/**/*',
      imgDst = './build/images';

  gulp.src(imgSrc)
    .pipe(changed(imgSrc))
    .pipe(imagemin())
    //.pipe(notify("Images minified"))
    .pipe(gulp.dest(imgSrc));
});

// JS concat and minify
gulp.task('scripts', function() {
  gulp.src(['./assets/js/plugins/*.js', './assets/js/src/*.js'])
    .pipe(plumber({
      errorHandler: reportError
     }))
    .pipe(concat(pkg.name + '.js'))
    .pipe(gulp.dest('./assets/js'))
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js'))
    .pipe(notify({message: 'JS processed!'}));
});

// CSS concat, auto-prefix and minify
gulp.task('sass', function() {
    gulp.src('assets/scss/**/*.scss')
    .pipe(plumber({
      errorHandler: reportError
     }))
    .pipe(plumber())
    .pipe(sass({style: 'expanded', includePaths: [ './assets/scss/partials', './assets/scss/modules', './assets/scss/helpers' ], errLogToConsole: true }))
    .pipe(autoprefix('last 6 version'))
    .pipe(rename(pkg.name + '.css'))
    .pipe(gulp.dest('assets/css'))
    // .pipe(reload({stream: true}))
    .pipe(notify({message: 'SCSS processed!'}));
});

//clean up css with nano
// gulp.task('nanocss', ['sass'], function() {
//     return gulp.src('./assets/css/' + pkg.name + '.css')
//         .pipe(nano({discardComments: {removeAll: true}}))
//         .pipe(rename(pkg.name + '.min.css'))
//         .pipe(gulp.dest('./assets/css/'))
//         .pipe(notify({message: 'CSS Nanofied!'}));
// });
gulp.task('svgstore', function () {
    return gulp
        .src('assets/images/svgsprite/*.svg')
        .pipe(svgmin())
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(gulp.dest('assets/images'));
});

gulp.task('svgmin', function() {
    return gulp.src('assets/images/svg/*.svg')
      .pipe(plumber())
        .pipe(svgmin())
        .pipe(gulp.dest('assets/images/svg'))
        .pipe(notify({message: 'svgs minified!'}));
});

gulp.task('setup', ['sass', 'scripts', 'html']);

gulp.task('serve', ['sass'], function() {

    browserSync({
        server: "./"
    });
    gulp.watch('assets/scss/**/*.scss', ['sass']);
    gulp.watch(['*.html', 'assets/css/**', 'assets/js/**']).on('change', reload);
});

gulp.task('default', ['connect', 'watch', 'serve']);

gulp.task('default', function () {
  gulp.start('scripts', 'sass', 'imagemin', 'svgmin', 'serve', 'svgstore');
  // Watch .js files
  gulp.watch('assets/js/src/*.js', ['scripts']);
});

