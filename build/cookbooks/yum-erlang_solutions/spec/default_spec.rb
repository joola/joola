require 'spec_helper'

describe 'yum-erlang_solutions::default' do
  context 'yum-erlang_solutions::default uses default attributes' do
    let(:chef_run) { ChefSpec::Runner.new.converge(described_recipe) }

    it 'creates yum_repository[erlang_solutions]' do
      expect(chef_run).to create_yum_repository('erlang_solutions')
    end
  end
end
