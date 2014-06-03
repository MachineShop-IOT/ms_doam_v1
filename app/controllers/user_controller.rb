require 'machineshop'
class UserController < ApplicationController
  def authenticate
    begin
    	auth_token, user = MachineShop::User.authenticate(
          :email => params['userlogin']['email'], #publisher@csr.com
          :password => params['userlogin']['password'] #password        
      )
      
      session[:auth_token] = auth_token
      
      redirect_to "/user/home", :status => :moved_permanently
    
      rescue MachineShop::AuthenticationError => ae
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
      rescue MachineShop::APIConnectionError => ape
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
      end
  	
  end

  def index    
  	render "index"
  end

  def home
    begin
      @deviceLists = Array.new
      devices = MachineShop::Device.all({},session[:auth_token])
      devices.to_a.each do |device|        
        @deviceLists << [device['name'],device['id']]
      end
    rescue MachineShop::AuthenticationError => ae
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    end

  end

  def apiKeyCheck
    begin
      allRoles = MachineShop::User.all_roles(params['apiKey']['api_key'])      
      session[:auth_token] = params['apiKey']['api_key']
      redirect_to "/user/home/"
    rescue MachineShop::AuthenticationError => ae
      redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    rescue MachineShop::APIConnectionError => ape
      redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    end
  end

end
