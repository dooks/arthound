# copy HTML
cat app/index.html > public/index.html

# concatenate CSS
cat \
app/css/bootstrap.min.css \
app/css/bootstrap-theme.min.css \
app/css/index.css \
app/css/rzslider.min.css \
> public/css/index.min.css

# copy fonts
cp -r app/fonts/* public/fonts

# copy images
cp -r app/img/* public/img

# Copy plugins;
cp app/js/angular.min.js public/js/angular.min.js
cp app/js/angular-route.min.js public/js/angular-route.min.js
cp app/js/angular-touch.min.js public/js/angular-touch.min.js
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
