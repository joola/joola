rm -rf /usr/share/nginx/html/*
jekyll build
cd ./_data/wiki/joola
gollum-site generate --output_path ../../../_site/docs
cd ../../../
cp -R ./_site/* /usr/share/nginx/html/