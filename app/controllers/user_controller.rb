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
      @deviceLists = Array.new
      devices = MachineShop::Device.all({},session[:auth_token])
      puts devices.to_a
      devices.to_a.each do |device|        
        @deviceLists << [device['name'],device['id']]
      end
    rescue MachineShop::AuthenticationError => ae
        redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end

    reports = MachineShop::Report.all({}, session[:auth_token])
    sample = reports.sample.payload.event.values.location
    @location = sample.to_a

    element_data = MachineShop::Report.all(
        ({:device_instance_id => '53845ce59818006e0900002f',
          :per_page=>'1000',
          #:created_at_between=>'2013-11-04T00:00:00_2014-03-19T17:02:00'
        }), session[:auth_token])

    puts "element data of f00e5981800ad58000006 #{element_data} "

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

  def devices_reports

    reports = MachineShop::Report.all({}, session[:auth_token])

    json_data = {reports: reports}

    respond_to do |format|
      format.json { render json: json_data.to_json }
    end
  end

end
