# mini HTML
cat app/index.html > public/index.html

# minify CSS
cat \
app/css/bootstrap.min.css \
app/css/bootstrap-theme.min.css \
app/css/index.css \
app/css/rzslider.min.css \
> public/css/index.min.css

# Copy plugins;
cp app/js/fastclick.js public/js/fastclick.js
cp app/js/rzslider.js public/js/rzslider.js

# Concatenate JS files
cat \
app/js/bootstrap.min.js \
app/js/bootstrap-toolkit.min.js \
app/js/angular.js \
app/js/services.js \
app/js/controller.js \
app/js/directives.js \
> public/js/index.min.js
