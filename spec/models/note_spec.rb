# frozen_string_literal: true

require "rails_helper"



RSpec.describe Note, type: :model do
  fixtures(:users)
  let(:user) { users(:user1) }

  context "#create" do
    it "should create a record" do
      t = Note.new(content: "Climate Change", user: user)
      t.save
      expect(t.errors.full_messages).to eq([])
    end

    it "should set the position as last if not given" do
      t0 = Note.create!(content: "note 0", user: user)
      t1 = t0.children.create!(content: "note 1", user: user)
      t2 = t0.children.create!(content: "note 2", user: user)
      t3 = t0.children.create!(content: "note 3", user: user)
      expect(t1.position).to eq(1)
      expect(t2.position).to eq(2)
      expect(t3.position).to eq(3)
    end

    it "should reorder siblings when position is given" do
      t0 = Note.create!(content: "note 0", user: user)
      t1 = t0.children.create!(content: "note 1", user: user)
      t2 = t0.children.create!(content: "note 2", user: user)
      t3 = t0.children.create!(content: "note 3", user: user)
      t4 = t0.children.create!(content: "note 4", position: 2, user: user)
      expect(t1.position).to eq(1)
      expect(t4.position).to eq(2)
      expect(t2.reload.position).to eq(3)
      expect(t3.reload.position).to eq(4)
    end

    it "position nil should add at the end" do
      t1 = Note.create!(content: "note 1", user: user)
      t2 = Note.create!(content: "note 2", position: nil, user: user)
      expect(t1.reload.position).to eq(1)
      expect(t2.reload.position).to eq(2)
    end

    describe "when no content but slug" do
      it "should create a record" do
        t = Note.new(slug: "climate_change", user: user)
        t.save
        expect(t.errors.full_messages).to eq([])
        expect(t.reload.content).to eq("Climate Change")
      end

      describe "when slug is a date" do
        it "should NOT titleize" do
          t = Note.new(slug: "2020-09-13", user: user)
          t.save
          expect(t.errors.full_messages).to eq([])
          expect(t.reload.content).to eq("2020-09-13")
        end
      end

      describe "when slug is a month" do
        it "should NOT titleize" do
          t = Note.new(slug: "2020-09", user: user)
          t.save
          expect(t.errors.full_messages).to eq([])
          expect(t.reload.content).to eq("2020-09")
        end
      end
    end
  end

  context "#update" do
    it "indenting should reorder both old siblings' positions" do
      t0 = Note.create!(content: "note 0", user: user)
      t1 = t0.children.create!(content: "note 1", user: user)
      t2 = t0.children.create!(content: "note 2", user: user)
      t3 = t0.children.create!(content: "note 3", user: user)
      t4 = t3.children.create!(content: "note 4", user: user)
      t5 = t3.children.create!(content: "note 4", user: user)

      t2.update!(ancestry: "#{t0.id}/#{t3.id}", position: 3)
      expect(t1.reload.position).to eq(1)
      expect(t3.reload.position).to eq(2)
      expect(t4.reload.position).to eq(1)
      expect(t5.reload.position).to eq(2)
      expect(t2.reload.position).to eq(3)
    end
  end

  context "#destroy" do
    it "should delete descendants" do
      Note.create!(content: "note 0", user: user)
      t1 = Note.create!(content: "note 1", user: user)
      t1.children.create!(content: "note 1", user: user)

      expect { t1.destroy }.to change { Note.count }.by(-2)
    end
  end
end
