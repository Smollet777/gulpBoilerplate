const gulp = require('gulp'),
  gulpif = require('gulp-if'),
  minimist = require('minimist'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
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
  return gulp.src('sass/**/*.+(sass|scss)')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 0.1%'],
      cascade: false
    }))
    .pipe(
      gulpif(options.env === 'production', cleanCSS({
        level: 2
      }))
    )
    .pipe(gulp.dest('dist'));
}

function watch() {
  browserSync.init({
    server: "./public",
    files: "",
    notify: false
  })

  gulp.watch(['public/sass/**/*.+(sass|scss)'], styles);
  gulp.watch(['public/js/**/*.js'], scripts);
  gulp.watch(['public/*.html']).on('change', browserSync.reload);
}

function scripts() {
  return gulp.src(['public/js/main.js', 'public/js/*.js'])
    .pipe(concat('all.min.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(gulp.dest('public/dist'))
}

function clean() {
  return del(['public/dist'])
}

gulp.task('watch', watch);
gulp.task('del', clean);
gulp.task('sass', styles);
gulp.task('build', gulp.series('del', gulp.parallel(scripts, styles)));