require 'rails_helper'

RSpec.describe DescendantsSorter do
  it "should return ..." do
    array = [
      { "content" => "one", "id" => "4", "ancestry" => "3", "position" => "2" },
      { "content" => "two", "id" => "5", "ancestry" => "3", "position" => "1" },
      { "content" => "one", "id" => "6", "ancestry" => "3/4", "position" => "2" },
      { "content" => "one", "id" => "7", "ancestry" => "3/4", "position" => "1" },
    ]
    sorter = DescendantsSorter.new(array)
    expect(sorter.sort).to eq ([
      { "content" => "two", "id" => "5", "ancestry" => "3", "position" => "1" },
      { "content" => "one", "id" => "4", "ancestry" => "3", "position" => "2" },
      { "content" => "one", "id" => "7", "ancestry" => "3/4", "position" => "1" },
      { "content" => "one", "id" => "6", "ancestry" => "3/4", "position" => "2" },
    ])
  end
end
