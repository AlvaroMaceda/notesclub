require './app/services/result'

RSpec.describe Result do

  let (:whatever) {
    { admits: 'whatever', as: 'error values and ok responses'}
  }

  it 'creates successful responses' do
    result = Result.ok(whatever)
    
    expect(result.success?).to be true 
    expect(result.error?).to be false
    expect(result.value).to eq whatever
    expect(result.errors).to be_nil
  end

  it 'creates error responses' do
    result = Result.error(whatever)
    
    expect(result.success?).to be false
    expect(result.error?).to be true
    expect(result.errors).to eq whatever
    expect(result.value).to be_nil
  end

  it 'cant be instantiated directly' do
    expect {Result.new}.to raise_error NoMethodError,/protected method `new' called/
  end

end
