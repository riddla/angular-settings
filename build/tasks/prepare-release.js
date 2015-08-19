// see https://github.com/aurelia/framework/blob/master/build/tasks/prepare-release.js

var gulp = require('gulp');

var bump = require('gulp-bump');
var args = require('../args');

gulp.task('bump-version', function(){
	return gulp.src(['./package.json', './bower.json'])
		.pipe(bump({type:args.bump })) //major|minor|patch|prerelease
		.pipe(gulp.dest('./'));
});