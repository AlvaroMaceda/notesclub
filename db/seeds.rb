# This file contains all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

help_user = User.create!(name: "Help", email: "help@help.org", username: "help", password: "help183A", password_confirmation: "help183A")
t1 = help_user.topics.create!(content: "Welcome")
t1.children.create!(content: "Welcome to the Book Notes Club!", user: help_user)

user = User.create!(name: "Marie Curie", email: "marie@curie.com", username: "curie", password: "46curie1", password_confirmation: "46curie1")
