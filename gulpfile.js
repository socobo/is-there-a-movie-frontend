// imports
var del = require("del");
var gulp = require("gulp");
var ghPages = require("gulp-gh-pages");
var gRun = require("gulp-run");
var merge = require("merge-stream");

// delete build and dist folder
gulp.task("clean", function() {
  return del.sync(["build", "dist", ".publish"]);
});

gulp.task("clean-output", function() {
  return del.sync("output");
})

// lint application
gulp.task("lint", ["clean-output"], function() {
  return gRun("polymer lint", {
      verbosity: 0
    })
    .exec()
    .pipe(gulp.dest("output/lint"));
});

// copy application to dist
gulp.task("copy", function() {
  // copy webcomponentsjs to dist/app
  var bcwc = gulp.src([
      "./build/bundled/app/bower_components/webcomponentsjs/webcomponents-lite.min.js",
    ])
    .pipe(gulp.dest("dist/app/bower_components/webcomponentsjs"));
  // copy promise-polyfill to dist/app
  var bcpp = gulp.src([
    "./build/bundled/app/bower_components/promise-polyfill/**/*"
  ])
  .pipe(gulp.dest("dist/app/bower_components/promise-polyfill"));
  // copy elements to dist/app
  var elem = gulp.src([
    "./build/bundled/app/elements/elements.html"
  ])
  .pipe(gulp.dest("dist/app/elements"));
  // copy images, styles, scripts to dist/app
  var rest = gulp.src([
    "./build/bundled/app/**/*",
    "!./build/bundled/app/bower_components/**/*",
    "!./build/bundled/app/elements/**/*",
    "!./build/bundled/app/test/**/*"
  ])
  .pipe(gulp.dest("dist/app"));
  //copy config to dist
  var config = gulp.src([
      "./build/bundled/polymer.json",
      "./build/bundled/service-worker.js",
      "./build/bundled/sw-precache-config.js",
      "./build/bundled/bower.json"
    ])
    .pipe(gulp.dest("dist"));
  // merge streams
  return merge(bcwc, bcpp, elem, rest, config);
});

// deploy dist to gh-pages
gulp.task("deploy", ["copy"], function() {
  return gulp.src("./dist/**/*")
    .pipe(ghPages());
});

// serve application
gulp.task("serve", ["clean-output"], function() {
  return gRun("polymer serve -o -p 8088", {
      verbosity: 0
    })
    .exec()
    .pipe(gulp.dest("output/serve"));
});

// serve bundled application
gulp.task("serve-bundled", ["clean-output"], function() {
  return gRun("cd build/bundled/ && polymer serve -o -p 8089", {
      verbosity: 0
    })
    .exec()
    .pipe(gulp.dest("output/serve"));
});

// serve bundled application
gulp.task("serve-unbundled", ["clean-output"], function() {
  return gRun("cd build/unbundled/ && polymer serve -o -p 8090", {
      verbosity: 0
    })
    .exec()
    .pipe(gulp.dest("output/serve"));
});

// test application
gulp.task("test", ["clean-output"], function() {
  return gRun("polymer test", {
      verbosity: 2
    })
    .exec()
    .pipe(gulp.dest("output/test"));
});

// test application --> skip selenium install
gulp.task("test-skip", ["clean-output"], function() {
  return gRun("polymer test --skip-selenium-install", {
      verbosity: 2
    })
    .exec()
    .pipe(gulp.dest("output/test"));
});