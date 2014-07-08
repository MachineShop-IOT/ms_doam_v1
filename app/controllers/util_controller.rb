# require 'rest-client'
require 'machineshop'
require 'RMagick'

class UtilController < ApplicationController
  # API_URL = 'http://stage.services.machineshop.io/api/v0'
  API_URL = 'https://services.machineshop.io/api/v0'

  def get_address_by_latlon()

    addresses = MachineShop::Mapping.geocode(
                                             {
                                               :latlng => params[:latlon],
                                               # :sensor => "false"
                                             }, session[:auth_token])

    puts "-------------------"
    puts addresses

    respond_to do |format|
      format.json { render json: addresses.to_json }
    end

  end

  def get_weather()

    state =  params[:state]
    city = params[:city].tr(" ", "+")

    url = "https://servies.machineshop.io/api/v0/platform/utility/weather?state=#{state}&city=#{city}"
    begin
      response = api_request(url, nil, :get, session[:auth_token])
    rescue Exception => e
      response = "Could not connect to the Weather source"
    end

    respond_to do |format|
      format.json { render json: response.to_json }
    end

  end

  def get_colored_image_for_device()

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

  #Utils function
  private

  def api_request(url, body_hash, http_verb, authentication_token)
    body = (http_verb == :get ? body_hash : body_hash.to_json)
    begin
      if http_verb == :get || http_verb == :delete
        json_response = RestClient.public_send(http_verb, url, api_headers(authentication_token).merge({ params: body }))
      else
        json_response = RestClient.public_send(http_verb, url, body, api_headers(authentication_token))
      end
    rescue RestClient::Exception => e
      json_response = e.http_body
    end

    json_response ||="[]"
    return JSON.parse(json_response, :symbolize_names => true)
  end

  def api_headers(authentication_token)
    heads = { content_type: :json, accept: :json }
    heads.merge!({ authorization: "Basic V0QxVjVzYjdUcG1ibmZuQlNEbks6WA==" }) if authentication_token
    puts "auth_token_hash : #{heads}"
    heads
  end
end
