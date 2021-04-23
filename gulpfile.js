const { watch, src, dest} = require('gulp'),
  gulpif = require('gulp-if'),
  minimist = require('minimist'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  del = require('del');

  const knownOptions = {
    string: 'env',
    default: {
      env: process.env.NODE_ENV || 'production'
    }
  };
  
  const options = minimist(process.argv.slice(2), knownOptions);

function styles() {
  return src('app/sass/main.+(sass|scss)')
      .pipe(
        gulpif(options.env === 'production', 
          sass({outputStyle: 'compressed'}).on('error', sass.logError), 
          sass().on('error', sass.logError)
        ))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
        grid: true,
        cascade: false
      }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream());
}

function bs(){
  clean()
  browserSync.init({
    server: "./app",
    notify: false
  })

  watch(['app/sass/**/*.+(sass|scss)'], styles);
  watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

function scripts() {
  return src(['app/js/*.js', 'app/js/main.js','!app/js/main.min.js'])
    .pipe(concat('main.min.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function clean() {
  return del(['dist','app/css/','app/js/main.min.js'])
}

function build(){
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/*.html'
  ],{base:'app'})
  .pipe(dest('dist'))
} 

exports.styles = styles;
exports.default = bs;
exports.scripts = scripts;
exports.del = clean;
exports.build = build;