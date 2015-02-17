require_relative '../../libraries/mongodb_config_helpers'

describe 'MongoDBConfigHelpers' do
  it 'convert to boost::program_options format' do
    extend ::MongoDBConfigHelpers
    input = {
      'string' => 'foo',
      'boolean' => true,
      'numeric' => 216,
      'absent' => nil,
      'empty-string' => ''
    }
    actual = to_boost_program_options input
    expected = "boolean = true\n" +
               "numeric = 216\n" +
               "string = foo"
    expect(actual).to eq(expected)
  end
end
