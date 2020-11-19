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
