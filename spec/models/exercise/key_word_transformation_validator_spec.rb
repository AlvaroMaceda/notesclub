require 'rails_helper'

RSpec.describe Exercise::KeyWordTransformationValidator, type: :model do
  fixtures(:all)

  it "should complain if data is not a JSON hash" do
    exercise = Exercise.create(name: "KeyWordTransformation", created_by: users(:user1))
    expect { exercise }.to change{ Exercise.count }.by(0)
    expect(exercise.errors.to_hash).to eq({data: ["must be a JSON hash"]})
  end

  it "should require all fields if none is passed" do
    exercise = Exercise.create(name: "KeyWordTransformation", created_by: users(:user1), data: {}.to_json)
    expect(exercise.errors.to_hash).to eq({data: [
      "solutions can't be blank.",
      "title can't be blank.",
      "description can't be blank.",
      "originalSentence can't be blank.",
      "part1 can't be blank.",
      "part2 can't be blank.",
      "word can't be blank."
    ]})
  end

  it "should pass all validations" do
    data = {
      "title"=>"Key Word Transformation",
      "description"=>"Write a second sentence so that it has a similar meaning to the first sentence,
      using the word given. Do not change the word given. You must use between three and six words,
      including the word given.",
      "originalSentence"=>"I was in favour of going to the cinema.",
      "part1"=>"I thought it would be",
      "word"=>"IDEA",
      "part2"=>"to the cinema.",
      "solutions"=>["a good idea to go", "to go"]
    }
    exercise = Exercise.create(name: "KeyWordTransformation", created_by: users(:user1), data: data.to_json)
    expect(exercise.errors.to_hash).to eq({})
  end
end
