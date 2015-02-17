# The build-essential cookbook was not running during the compile phase, install gcc explicitly for rhel so native
# extensions can be installed
gcc = package 'gcc' do
  action :nothing
  only_if { platform_family?('rhel') }
end
gcc.run_action(:install)

node['mongodb']['ruby_gems'].each do |gem, version|
  chef_gem gem do
    version version
  end
end
