# require 'rest-client'
require 'machineshop'
require 'RMagick'

class UtilController < ApplicationController

  API_URL = 'http://stage.services.machineshop.io/api/v0'

  def get_address_by_latlon()

    addresses = MachineShop::Mapping.geocode(
        {
          :latlng => params[:latlon],
          # :sensor => "false"
        }, session[:auth_token])

    respond_to do |format|
      format.json { render json: addresses.to_json }
    end
      
  end

  def get_weather()

    state =  params[:state]
    city = params[:city].tr(" ", "+")

    url = "http://192.168.0.119:3000/api/v1/platform/utility/weather_report/?state=#{state}&city=#{city}"
    response = api_request(url, nil, :get, session[:auth_token])

    respond_to do |format|
      format.json { render json: response.to_json }
    end
      
  end

  #Utils function
    private
    def platform_request(endpoint, body_hash, http_verb, authentication_token)
      url = "#{API_URL}#{endpoint}"
      # puts "Request url : #{url}"
      body = (http_verb == :get ? body_hash : body_hash.to_json)
      begin
        if http_verb == :get || http_verb == :delete
          json_response = RestClient.public_send(http_verb, url, headers(authentication_token).merge({ params: body }))
        else
          json_response = RestClient.public_send(http_verb, url, body, headers(authentication_token))
        end
      rescue RestClient::Exception => e
        json_response = e.http_body
      end

      json_response ||="[]"
      return JSON.parse(json_response, :symbolize_names => true)
    end

    def headers(authentication_token)
      heads = { content_type: :json, accept: :json }
      heads.merge!({ authorization: "Basic " + Base64.encode64(authentication_token+':X') }) if authentication_token
      puts "auth_token_hash : #{heads}"
      heads
    end

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
