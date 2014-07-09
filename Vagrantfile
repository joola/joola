# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty32"
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 8081, host: 8081

  config.vm.provider "virtualbox" do |vb|
    vb.customize ["modifyvm", :id, "--memory", "2048"]
    vb.customize ["modifyvm", :id, "--cpus", "2"]
  end
  
  config.vm.provision "chef_solo" do |chef|
    chef.log_level = :debug
    chef.verbose_logging = true
    chef.cookbooks_path = "./build/cookbooks"
    chef.custom_config_path = "./build/cookbooks/VagrantConfig.chef"
    chef.add_recipe "nodejs"
    chef.add_recipe "redisio::install"
    chef.add_recipe "redisio::enable"
    chef.add_recipe "mongodb"
    chef.add_recipe "rabbitmq"
    chef.add_recipe "joola"
  end
end
