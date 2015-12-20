# Uglify initial files
node_modules/.bin/browserify \
app/js/angular.js \
app/js/services.js \
app/js/controller.js \
app/js/directives.js \
| node_modules/.bin/uglifyjs > app/js/index.js;

# concatenate rest of JS files
node_modules/.bin/browserify \
app/js/bootstrap.min.js \
app/js/bootstrap-toolkit.min.js \
app/js/index.js \
| node_modules/.bin/uglifyjs > public/js/index.js;
