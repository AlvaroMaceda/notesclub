# This receives an array of descendants
# And sort according to ancestry and position to prepare for insert
class DescendantsSorter
  def initialize(descendants)
    @descendants = descendants
  end

  def sort
    descendants.sort_by do |descendant|
      [
        descendant["ancestry"].split("/").size,
        descendant["position"] || 100000000
      ]
    end
  end

  private

  attr_reader :descendants
end
