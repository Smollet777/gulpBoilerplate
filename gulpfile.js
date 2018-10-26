const gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  pump = require('pump'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  del = require('del');

const AUTOPREFIXER_CONF={browsers: ['> 0.1%'],cascade: false}
  
gulp.task('sass', (cb) => {
  pump([
      gulp.src('public/sass/**/*.+(sass|scss)'),
      sass(),
      autoprefixer(AUTOPREFIXER_CONF),
      gulp.dest('public/css'),
      browserSync.stream()
    ],
    cb
  );
});

gulp.task('browser-sync', () =>
  browserSync.init({
    server: "./public",
    files: "",
    notify: false
  })
);

gulp.task('watch', ['browser-sync', 'sass'], () => {
  gulp.watch(['public/sass/**/*.+(sass|scss)'], ['sass']);
  gulp.watch(['*.html', 'public/js/**/*.js']).on('change', browserSync.reload);
});

gulp.task('scripts', (cb) => {
  pump([
      gulp.src(['public/js/main.js','public/js/*.js']),
      concat('all.min.js'),
      babel({
        presets: ['@babel/env']
      }),
      uglify(),
      gulp.dest('public/dist/')
    ],
    cb
  );
});

gulp.task('del', () => del.sync(['public/dist']));

gulp.task('build', ['del', 'scripts'], (cb) => {
  pump([
      gulp.src('public/sass/**/*.+(sass|scss)'),
      sass({
        outputStyle: 'compressed'
      }),
      autoprefixer(AUTOPREFIXER_CONF),
      gulp.dest('public/dist')
    ],
    cb
  );
});
