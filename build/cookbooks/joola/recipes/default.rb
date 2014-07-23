rabbitmq_plugin "rabbitmq_management" do
  action :enable
end

rabbitmq_plugin "rabbitmq_stomp" do
  action :enable
end

bash "install joola" do
  user "root"
  code <<-EOH
    mkdir /opt/joola
    mkdir /var/log/joola
    cd /opt/joola
    
    sudo chown -R root /root/.npm
    
    npm install /vagrant --production
    chown -R vagrant /opt/joola
    chown -R vagrant /var/log/joola
  EOH
end

#bash "install pm2" do
#  user "root"
#  code <<-EOH
#    npm install -g pm2 --production
#    pm2 kill
#  EOH
#end

#bash "run joola (using pm2)" do
#  user "vagrant"
#  code <<-EOH
#    cd /opt/joola/node_modules/joola
#    
#    pm2 start joola.js
#  EOH
#end