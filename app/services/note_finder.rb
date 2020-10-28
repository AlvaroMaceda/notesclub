class NoteFinder < ApplicationService

  def initialize(search_params = {})
    search_params = search_params.transform_keys(&:to_sym)

    @params = search_params.slice(
      :ids, :except_ids, :id_lte, :id_gte,
      :slug, :except_slug,
      :user_ids, 
      :content, :content_like,
      :ancestry, 
      :skip_if_no_descendants,
      :include_user, :include_ancestors, :include_descendants,
      :limit
    )

    @params[:ids] = Array(@params[:ids]) if @params[:ids]
    @params[:user_ids] = Array(@params[:user_ids]) if @params[:user_ids]
  end

  def call
    # TO-DO: decide about logging system. Should it be in services, or in ports?
    # track_note if @params[:user_ids] && @params[:user_ids].is_a?(Array) && @params[:user_ids].size == 1

    notes = Note
    notes = notes.where(id: @params[:ids]) if @params[:ids].present? && @params[:ids].is_a?(Array)
    notes = notes.where(user_id: @params[:user_ids]) if @params[:user_ids].present? && @params[:user_ids].is_a?(Array)
    notes = notes.where(ancestry: @params[:ancestry]&.empty? ? nil : @params[:ancestry]) if @params.include?(:ancestry)
    notes = notes.where(slug: @params[:slug]) if @params[:slug]
    notes = notes.where(content: @params[:content]) if @params[:content]

    if @params[:content_like]
      notes = notes.where("lower(content) like ?", @params[:content_like].downcase)
    end
    if @params[:except_ids].present?
      notes = notes.where.not(id: @params[:except_ids])
    end
    if @params[:id_lte].present?
      notes = notes.where("notes.id <= ?", @params[:id_lte])
    end
    if @params[:id_gte].present?
      notes = notes.where("notes.id >= ?", @params[:id_gte])
    end
    if @params[:except_slug].present?
      notes = notes.where.not(slug: @params[:except_slug])
    end
    if @params[:skip_if_no_descendants]
      notes = notes.joins("inner join notes as t on t.ancestry = cast(notes.id as VARCHAR(255)) and t.position=1 and t.content != ''")
    end
    limit = @params[:limit] ? [@params[:limit].to_i, 100].min : 100
    limit = 1 if @params[:slug] || (@params[:ids] && @params[:ids].size == 1)
    notes = notes.order(id: :desc).limit(limit)

    methods = []
    methods << :descendants if @params[:include_descendants]
    methods << :ancestors if @params[:include_ancestors]
    methods << :user if @params[:include_user]

    Result.ok notes.as_json(methods: methods)
  end
  

end
