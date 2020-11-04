# frozen_string_literal: true

def rm_timestamps!(obj)
  obj.except!("created_at", "updated_at")
  obj["descendants"].map { |o| o.except!("created_at", "updated_at") } if obj["descendants"]
  obj["ancestors"].map { |o| o.except!("created_at", "updated_at") } if obj["ancestors"]
  obj["user"].except!("created_at", "updated_at") if obj["user"]
  obj
end

def rm_timestamps(obj)
  obj = obj.except("created_at", "updated_at")
  obj["descendants"] = obj["descendants"].map { |o| o.except("created_at", "updated_at") } if obj["descendants"]
  obj["ancestors"] = obj["ancestors"].map { |o| o.except("created_at", "updated_at") } if obj["ancestors"]
  obj["user"] = obj["user"].except("created_at", "updated_at") if obj["user"]
  obj
end

def rm_timestamps_from_array!(arr)
  arr.map { |obj| rm_timestamps!(obj) }
end
