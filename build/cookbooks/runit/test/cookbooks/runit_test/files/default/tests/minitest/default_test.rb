#
# Cookbook Name:: runit_test
# Recipe:: default
#
# Copyright 2012, Opscode, Inc.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

require File.expand_path('../support/helpers', __FILE__)

describe 'runit_test::default' do
  include Helpers::RunitTest

  describe 'packages' do
    it 'has been installed' do
      package('runit').must_be_installed
    end
  end

  it 'The service runitsvdir should be running' do
    service('runsvdir').must_be_running if node['platform_family'] == 'ubuntu'
  end

  it 'The directory /etc/service should exist' do
    directory('/etc/service').must_exist
  end

  it 'It should have a file called runsvdir in /etc/event.d' do
    file('/etc/event.d/runsvdir').must_exist if node['platform'] == 'ubuntu'
  end

  it 'It should have a file called run in /etc/sv/getty-5' do
    file('/etc/sv/getty-5/run').must_exist if node['platform_family'] == 'debian'
  end

end
