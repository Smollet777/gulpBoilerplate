const gulp = require('gulp'),
  gulpif = require('gulp-if'),
  minimist = require('minimist'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  del = require('del'),
  imagemin = require('gulp-imagemin');

  const knownOptions = {
    string: 'env',
    default: {
      env: process.env.NODE_ENV || 'production'
    }
  };
  
  const options = minimist(process.argv.slice(2), knownOptions);

function styles() {
  return gulp.src('app/sass/**/*.+(sass|scss)')
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
      .pipe(gulp.dest('app/css'))
      .pipe(browserSync.stream());
}

function bs(){
  browserSync.init({
    server: "./app",
    notify: false
  })

  gulp.watch(['app/sass/**/*.+(sass|scss)'], styles);
  gulp.watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);
  gulp.watch(['app/*.html']).on('change', browserSync.reload);
}

function scripts() {
  return gulp.src(['app/js/main.js', 'app/js/*.js', '!app/js/main.min.js'])
    .pipe(concat('main.min.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp.src('app/images/**/*')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
              ]
            })
    ]))
  .pipe(gulp.dest('dist/images'))
}

function clean() {
  return del(['dist','app/css/','app/js/main.min.js'])
}

gulp.task('watch', bs);
gulp.task('del', clean);
gulp.task('scripts',scripts);
gulp.task('styles', styles);
gulp.task('build', gulp.series('del', gulp.parallel(scripts, styles, images)));