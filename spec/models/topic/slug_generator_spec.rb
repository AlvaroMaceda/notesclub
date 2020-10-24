require 'rails_helper'

RSpec.describe Note::SlugGenerator, type: :model do
  fixtures(:users)
  let(:note) { Note.new(content: 'Climate Change', user_id: 2) }

  describe 'new record' do
    describe 'ancestry=nil' do
      it 'should parametrize content' do
        generator = Note::SlugGenerator.new(note)
        expect(generator.generate_unique_slug).to eq('climate_change')
      end

      it 'should parametrize url' do
        note = Note.new(content: "https://thisurl.com/whatever")
        generator = Note::SlugGenerator.new(note)
        expect(generator.generate_unique_slug).to eq('https_thisurl_com_whatever')
      end

      it 'should shorten to 100 characters' do
        long_string = 'Paleoclimatology is the study of ancient climates. Since very few direct observations of climate are available before the 19th century, paleoclimates are inferred from proxy variables that include non-biotic evidence such as sediments found in lake beds and ice cores, and biotic evidence such as tree rings and coral. Climate models are mathematical models of past, present and future climates.'
        note = Note.new(content: long_string)
        generator = Note::SlugGenerator.new(note)
        expect(generator.generate_unique_slug.size <= 100).to eq(true)
      end

      context 'when slug already exists' do
        before do
          Note.create!(content: 'Climate Change', user: note.user)
        end

        it 'should add two random char after parametrization' do
          generator = Note::SlugGenerator.new(note)
          expect(SecureRandom).to receive(:urlsafe_base64).with(1).and_return('ja')
          expect(generator.generate_unique_slug).to eq('climate_changeja')
        end
      end
    end

    context 'ancestry NON nil' do
      before do
        note.update!(ancestry: '1')
      end

      it 'should generate a random slug' do
        generator = Note::SlugGenerator.new(note)
        expect(SecureRandom).to receive(:urlsafe_base64).with(Note::SlugGenerator::BYTES_NUMBER).and_return('r9qxfhmt39mgabzn0a9o')
        expect(generator.generate_unique_slug).to eq('r9qxfhmt39mgabzn0a9o')
      end

      context 'when random already exists' do
        before do
          t = Note.create!(content: 'whatever', user: note.user)
          t.update_column(:slug, 'r9qxfhmt39mgabzn0a9o')
        end

        it 'should generate a new one' do
          generator = Note::SlugGenerator.new(note)
          expect(SecureRandom).to receive(:urlsafe_base64).with(Note::SlugGenerator::BYTES_NUMBER).once.and_return('r9qxfhmt39mgabzn0a9o')
          expect(SecureRandom).to receive(:urlsafe_base64).with(Note::SlugGenerator::BYTES_NUMBER).once.and_return('33333333333333333333')
          expect(generator.generate_unique_slug).to eq('33333333333333333333')
        end
      end
    end
  end
end
