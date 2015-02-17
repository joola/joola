name              'erlang'
maintainer        'Opscode, Inc.'
maintainer_email  'cookbooks@opscode.com'
license           'Apache 2.0'
description       'Installs erlang, optionally install GUI tools.'
version           '1.5.5'

depends           'apt', '>= 1.7.0'
depends           'yum', '~> 3.0'
depends           'yum-epel'
depends           'yum-erlang_solutions'
depends           'build-essential'

recipe 'erlang', 'Installs Erlang via native package, source, or Erlang Solutions package'
recipe 'erlang::package', 'Installs Erlang via native package'
recipe 'erlang::source', 'Installs Erlang via source'
recipe 'erlang::esl', "Installs Erlang from Erlang Solutions' package repositories"

%w{ ubuntu debian redhat centos scientific amazon oracle }.each do |os|
  supports os
end
