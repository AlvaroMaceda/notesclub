# frozen_string_literal: true

class AddMarketingToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :marketing, :boolean, default: false
  end
end
