# This file contains all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

help_user = User.create!(name: "Help", email: "help@help.org", username: "help", password: "help183A", password_confirmation: "help183A")
help_user.confirm
note1 = help_user.notes.create!(content: "Welcome")
note1.children.create!(content: "Welcome to the Book Notes Club!", user: help_user)

user = User.create!(name: "Marie Curie", email: "marie@curie.com", username: "curie", password: "mariecurie", password_confirmation: "mariecurie")
user.confirm
