# frozen_string_literal: true

class DropGoldenTicketsAndWaitingUsers < ActiveRecord::Migration[6.0]
  def change
    raise "waiting users must be empty!" if WaitingUser.count > 0

    drop_table :waiting_users
    drop_table :golden_tickets
  end
end
