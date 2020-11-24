# frozen_string_literal: true

require "pp"

def rm_timestamps!(obj)
  obj.except!("created_at", "updated_at")
  obj["descendants"].map { |o| o.except!("created_at", "updated_at") } if obj["descendants"]
  obj["ancestors"].map { |o| o.except!("created_at", "updated_at") } if obj["ancestors"]
  obj["user"].except!("created_at", "updated_at") if obj["user"]
  obj
end

# TO-DO: refactor this
def rm_timestamps(obj)
  obj = obj.except("created_at", "updated_at", :created_at, :updated_at)
  obj["descendants"] = obj["descendants"].map { |o| o.except("created_at", "updated_at") } if obj["descendants"]
  obj["ancestors"] = obj["ancestors"].map { |o| o.except("created_at", "updated_at", :created_at, :updated_at) } if obj["ancestors"]
  obj[:ancestors] = obj[:ancestors].map { |o| o.except("created_at", "updated_at", :created_at, :updated_at) } if obj[:ancestors]
  obj["user"] = obj["user"].except("created_at", "updated_at") if obj["user"]
  obj
end

def rm_timestamps_from_array!(arr)
  arr.map { |obj| rm_timestamps!(obj) }
end

def notes_data(a)
  return rm_timestamps(a) unless a.kind_of?(Array)
  a.map do |t|
    rm_timestamps(t.as_json)
  end
end


DEFAULT_NOTE_RELEVANT_FIELDS = [
  :id, :content, :slug,
  :user_id, :position,
  :ancestry, :descendants, :ancestors
]
def slice_symbol_and_string(hash, *keys)
  if keys.count == 1 && keys[0].kind_of?(Array)
    keys = keys[0]
  end
  keys_to_slice = keys.clone.map(&:to_sym) + keys.clone.map(&:to_s)
  hash.slice(*keys_to_slice)
end

def relevant_note_fields(note_hash, relevant_fields = DEFAULT_NOTE_RELEVANT_FIELDS)
  if note_hash.kind_of?(Array)
    notes = note_hash
    notes.map do |n|
      relevant_note_fields n, relevant_fields
    end
  else
    note_hash = note_hash.deep_dup

    note_hash = slice_symbol_and_string(note_hash, relevant_fields)
    # Descendants
    note_hash["descendants"] = relevant_note_fields(note_hash["descendants"], relevant_fields) if note_hash["descendants"]
    note_hash[:descendants] = relevant_note_fields(note_hash[:descendants], relevant_fields) if note_hash[:descendants]
    # Ancestors
    note_hash["ancestors"] = relevant_note_fields(note_hash["ancestors"], relevant_fields) if note_hash["ancestors"]
    note_hash[:ancestors] = relevant_note_fields(note_hash[:ancestors], relevant_fields) if note_hash[:ancestors]
    # User
    note_hash["user"] = note_hash["user"].except("created_at", "updated_at") if note_hash["user"]

    note_hash
  end
end

def notes_slugs(notes)
  notes.map { |note| note.with_indifferent_access[:slug] }
end

def make_note(note_data)
  result = NoteCreator.call(note_data)
  # Don't get mad if we make an error with spec's data
  raise "Incorrect data for the note. Review your spec's call to make_note: #{result.errors}" unless result.success?
  id = result.value[:id]
  note_data.merge!(id: id).stringify_keys
end

# This function can dump the test datatabase in the middle of a test run, in case you need to debug some SQL
# It will only work if you disable DatabaseCleaner commenting all lines in database_cleaner.rb
# so you should be running a single test, maybe using --tag option in rspec
def dump_test_database(dump_name = "test_dump_#{Time.now.strftime('%Y%m%d-%H%M%S')}.dump")
  host = ActiveRecord::Base.connection_config[:host]
  port = ActiveRecord::Base.connection_config[:port]
  database = ActiveRecord::Base.connection_config[:database]
  username = ActiveRecord::Base.connection_config[:username]

  cmd = <<~EOF
    pg_dump \
     --host #{host} --port #{port} --username #{username} \
     --data-only --verbose --no-owner --no-acl \
     --encoding=utf8 \
     #{database} --file=#{Rails.root}/tmp/#{dump_name}
  EOF
  system(cmd)
end
