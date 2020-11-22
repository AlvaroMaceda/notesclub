# frozen_string_literal: true

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
  :ancestry, :descendants
]
def slice_symbol_and_string(hash, *keys)
  if keys.count == 1 && keys[0].kind_of?(Array)
    keys = keys[0]
  end
  keys_to_slice = keys.clone.map(&:to_sym) + keys.clone.map(&:to_s)
  hash.slice(*keys_to_slice)
end

def relevant_note_fields(note, relevant_fields = DEFAULT_NOTE_RELEVANT_FIELDS)
  if note.kind_of?(Array)
    notes = note
    notes.map do |n|
      relevant_note_fields n, relevant_fields
    end
  else
    note = note.deep_dup

    note = slice_symbol_and_string(note, relevant_fields)
    # Descendants
    note["descendants"] = relevant_note_fields(note["descendants"]) if note["descendants"]
    note[:descendants] = relevant_note_fields(note[:descendants]) if note[:descendants]
    # Ancestors
    note["ancestors"] = relevant_note_fields(note["ancestors"]) if note["ancestors"]
    note[:ancestors] = relevant_note_fields(note[:ancestors]) if note[:ancestors]
    # User
    note["user"] = note["user"].except("created_at", "updated_at") if note["user"]

    note
  end
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
