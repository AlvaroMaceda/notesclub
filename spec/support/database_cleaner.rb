# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  # Uncomment this is you want to use before(:all) hooks which create database records
  config.before(:all) do
    DatabaseCleaner.start
  end

  config.after(:all) do
    DatabaseCleaner.clean
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do |example|
    # You can disable cleaning adding skip_db_cleaner: true in specific tests:
    #
    # it 'does not clean the database', skip_db_cleaner: true do ...
    #     ...
    # end
    #
    unless example.metadata[:skip_db_cleaner]
      DatabaseCleaner.start
    end
  end

  config.after(:each) do |example|
    unless example.metadata[:skip_db_cleaner]
      DatabaseCleaner.clean
    end
  end
end
