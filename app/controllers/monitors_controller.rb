# require 'RMagick'
class MonitorsController < ApplicationController

  # before_filter :require_signed_in_user

  def test
    puts "aaa"
    
  end

  def monitor_tracked_item
    @di_ids = []
    devices = MachineShopApi.get_device_instances(user)
    devices.each do |di|
      @di_ids << di[:_id].to_s
    end
  end

  def get_tracked_items
    hash = {}
    di_s = MachineShopApi.get_device_instances(user)

    di_ids = []
    item_names = []

    #send data or error message
    #if di_s[:error].blank?
      di_s.each do |di|
        di[:device_name] = di[:name]
        if !di[:item_id].blank?
          item = Item.find_by_device_instance_id(di[:_id])
          if item
            di_ids << item.device_instance_id
            item_names << item.name
          end
        end
      end

      di_ids.zip(item_names).each do |id, name|
        di = di_s.select { |hash| hash[:_id] == id }        
        di[0][:name] = name        
        di_s.delete_if { |hash| hash[:_id] == id }
        di_s << di[0]
      end

      jsonData = hash.merge!({jsonData: {totalCount: di_s.length, data: di_s}})
      respond_to do |format|
        format.json { render json: jsonData.to_json }
      end
    #else
      #jsonData = di_s
      #respond_to do |format|
      #  format.json { render json: di_s.to_json }
      #end
      #render :json => di_s.to_json
    #end


  end

  def get_locations
    hash = {}
    dids = params[:dids]

    items = MachineShopApi.get_device_instances_last_report(current_user, dids.split(","))
    json_data_values = hash.merge!({jsonData: {totalCount: items.values.length, data: items.values}})

    json_data_ary = json_data_values[:jsonData][:data]
    json_data_ary.delete_if {|x| x == "NO REPORTS"}

    json_data = {jsonData: {totalCount: items.values.length, data: json_data_ary}}

    respond_to do |format|
      format.json { render json: json_data.to_json }
    end
  end

  def get_report_interval_for_device
    hash = {}
    device_id = params[:device_id]
    policies = MachineShopApi.get_tracking_device_policy(current_user, device_id)
    jsonData = hash.merge!({jsonData: {policy: policies, device_id: device_id}})
    respond_to do |format|
      format.json { render :json => jsonData.to_json}
    end
  end

  def get_initial_positions_for_dynamic_tracking
    hash = {}
    device_id = params[:device_id]
    requested_time_interval = params[:requested_time_interval].to_i

    # Find out when last report was put up
    reports = MachineShopApi.get_device_instances_last_report(current_user, [device_id])
    device_datetime = Time.parse(reports[device_id.to_sym][:device_datetime])
    start_date = device_datetime - requested_time_interval.minutes
    device_reports = MachineShopApi.get_reports(current_user, device_id, start_date.utc.strftime("%Y-%m-%dT%H:%M:%S"),
                                                                        device_datetime.utc.strftime("%Y-%m-%dT%H:%M:%S"))

    jsonData = hash.merge!({jsonData: {totalCount: device_reports.length, data: device_reports}})
    respond_to do |format|
      format.json {render json: jsonData.to_json}
    end
  end

  def get_reports_for_device
    hash = {}
    device_id = params[:device_id]
    start_date = params[:start_date].nil? ? nil : params[:start_date]
    end_date = params[:end_date].nil? ? nil : params[:end_date]
    device_reports = MachineShopApi.get_reports(current_user, device_id, start_date, end_date)
    jsonData = hash.merge!({jsonData: {totalCount: device_reports.length, data: device_reports}})
    respond_to do |format|
      format.json {render json: jsonData.to_json}
    end
  end


  def get_colored_image_for_device

    puts "Returning image for #{params[:color]}"
    image_size = 12 
    circleX = 5
    circleY = 5
    radius = 5

    canvas = Magick::Image.new(image_size, image_size) { self.background_color = '#ffffff00' }
    canvas.format='PNG'
   
    gc = Magick::Draw.new
  
    gc.stroke(params[:color])
    gc.fill(params[:color])
    
    gc.stroke_width(1)
    gc.fill_opacity(1)

    # rmagick, instead of allowing one to specify a center and
    # radius, requires a dev to specify the center and then 
    # specify a *point on the perimeter*
    gc.circle(circleX, circleY, circleX - radius, circleX)
  
    gc.draw(canvas)
 
    send_data canvas.to_blob, :type => 'image/png',:disposition => 'inline'
  end

end
