# frozen_string_literal: true

class RenameTopicsIntoNotes < ActiveRecord::Migration[6.0]
  def change
    rename_table :topics, :notes
  end
end
