# mini HTML
cat app/index.html > public/index.html

#minify CSS
cat app/css/index.css > public/css/index.min.css

# Concatenate JS files
node_modules/.bin/browserify \
app/js/bootstrap.min.js \
app/js/bootstrap-toolkit.min.js \
app/js/angular.js \
app/js/services.js \
app/js/controller.js \
app/js/directives.js \
> public/js/index.min.js
