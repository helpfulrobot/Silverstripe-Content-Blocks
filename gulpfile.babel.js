'use strict';

import {join, normalize} from 'path';
import fs from 'fs';
import gulp from 'gulp';
import sourceMaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import browserify from 'gulp-browserify';
import babelify from 'babelify';

export const ROOT_DIR = normalize(join(__dirname));
export const CONFIG = {
    DIR: {
        SRC: 'src',
        DIST: 'assets',
        JS: 'javascript',
        CSS: 'styles'
    },
    BROWSERS: [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ]
};
export const JS_FILES = (() => {
    let files = [];

    fs.readdirSync(join(CONFIG.DIR.SRC, CONFIG.DIR.JS)).map(file => {
        if (file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2) == 'js') {
            files.push(file);
        }
    });

    return files;
})();
export function javascript(source = [], output = '') {
    if (output == '' || source.length <= 0) return false;

    return gulp.src(source)
        .pipe(sourceMaps.init())
        .pipe(browserify({
            transform: ["babelify"],
            entries: source.map(item => {
                return join(ROOT_DIR, item);
            }),
            paths: [
                join(ROOT_DIR, 'node_modules'),
                join(ROOT_DIR, CONFIG.DIR.SRC)
            ]
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat(output))
        .pipe(uglify())
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest(`${CONFIG.DIR.DIST}/${CONFIG.DIR.JS}`));
};
export function styles() {
    return gulp.src(`${CONFIG.DIR.SRC}/${CONFIG.DIR.CSS}/**/*.{sass,scss}`)
        .pipe(
            sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError)
        )
        .pipe(autoprefixer(CONFIG.BROWSERS))
        .pipe(gulp.dest(`${CONFIG.DIR.DIST}/${CONFIG.DIR.CSS}`));
};

let jsTasks = [];

JS_FILES.forEach(file => {
    let taskName = `javascript-${file.replace('.js', '')}`;

    gulp.task(taskName, () => javascript([join(CONFIG.DIR.SRC, CONFIG.DIR.JS, file)], file));

    jsTasks.push(taskName);
});

gulp.task('styles', () => styles());

gulp.task('javascript', jsTasks);

gulp.task('default', ['javascript', 'styles']);

gulp.task('watch', ['default', 'javascript', 'styles'], () => {
    gulp.watch(`${CONFIG.DIR.SRC}/${CONFIG.DIR.JS}/**/*.js`, ['javascript']);
    gulp.watch(`${CONFIG.DIR.SRC}/${CONFIG.DIR.CSS}/**/*.{sass,scss}`, ['styles']);
});