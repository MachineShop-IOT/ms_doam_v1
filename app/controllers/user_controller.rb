require 'machineshop'
class UserController < ApplicationController
  def authenticate
    begin
    	auth_token, user = MachineShop::User.authenticate(
          :email => params['userlogin']['email'], #publisher@csr.com
          :password => params['userlogin']['password'] #password        
      )    

      session[:auth_token] = auth_token
      redirect_to "/home", :status => :moved_permanently
    
      rescue MachineShop::AuthenticationError => ae
        redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
      rescue MachineShop::APIConnectionError => ape
        redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
      end  	
  end

  def logout
    session[:auth_token] = nil
    redirect_to "/index"
  end

  def index
    puts " param value in index --------------------------- #{params[:login]}"
  	render "index"
  end

  def home
    begin
        @dis_list = Array.new
        dis = MachineShop::DeviceInstance.all({}, session[:auth_token])
        dis.to_a.each do |di|        
            @dis_list << [di['name'], di['_id']]
        end
    rescue MachineShop::AuthenticationError => ae
        redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end

    @location = get_location_data

  end

  def apiKeyCheck
    begin
      allRoles = MachineShop::User.all_roles(params['apiKey']['api_key'])      
      session[:auth_token] = params['apiKey']['api_key']
      redirect_to "/home"
    rescue MachineShop::AuthenticationError => ae
      redirect_to "/index/false", :status => :moved_permanently, :login => 'asdad'
    rescue MachineShop::APIConnectionError => ape
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end
  end

  def get_last_reports
    last_reports = Array.new
    dis = MachineShop::DeviceInstance.all({}, session[:auth_token])
    dis.to_a.each do |di|        
        last_reports << di['last_report']
    end

    json_data = {last_reports: dis}

    respond_to do |format|
      format.json { render json: json_data.to_json }
    end

  end

  def get_location_data
    sample = Array.new
    dis = MachineShop::DeviceInstance.all({}, session[:auth_token])
    dis.to_a.each do |di|
        if di['last_report'].present?
            if di['last_report']['payload'].present?
                if di['last_report']['payload']['event'].present?
                    if di['last_report']['payload']['event']['values'].present?
                        if di['last_report']['payload']['event']['values']['location'].present?
                            sample << di['last_report']['payload']['event']['values']['location']
                        end
                    end
                end
            end
        end
    end
    sample
      
  end

end
