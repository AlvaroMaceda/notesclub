# frozen_string_literal: true

class RmOldRoleColumn < ActiveRecord::Migration[6.0]
  def change
    remove_column :users, :role
  end
end
