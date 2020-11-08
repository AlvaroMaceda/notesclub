# frozen_string_literal: true

class NoteCreator < ApplicationService
  def initialize(params)
    @include_descendants = params[:include_descendants]
    @include_ancestors = params[:include_ancestors]
    @include_user = params[:include_user]

    @data = params.except(:include_descendants, :include_ancestors, :include_user)
  end

  def call
    note = Note.new(@data)
    return Result.error note.errors.full_messages unless note.save

    methods = []
    methods << :descendants if @include_descendants
    methods << :ancestors if @include_ancestors
    methods << :user if @include_user

    Result.ok note.as_json(methods: methods).symbolize_keys
  end
end
