# mini HTML
node_modules/.bin/html-minifier \
--remove-comments --collapse-whitespace \
--collapse-boolean-attributes --remove-redundant-attributes \
--use-short-doctype --remove-empty-attributes --remove-optional-tags \
app/index.html > public/index.html

# minify and concatenate
node_modules/.bin/cleancss \
-o public/css/index.css app/css/index.css
cat \
app/css/bootstrap.min.css \
app/css/bootstrap-theme.min.css \
public/css/index.css \
app/css/rzslider.min.css \
> public/css/index.min.css

# copy fonts
cp -r app/fonts/* public/fonts

# copy images
cp -r app/img/* public/img

# Copy plugins
cp app/js/hammer.min.js public/js/hammer.min.js
cp app/js/angular-hammer.min.js public/js/angular-hammer.min.js
cp app/js/fastclick.js public/js/fastclick.js
cp app/js/rzslider.js public/js/rzslider.js

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
| node_modules/.bin/uglifyjs > public/js/index.min.js;


