require 'machineshop'
class UserController < ApplicationController
  # attr_accessor :auth_token  

  def authenticate
    begin
    	auth_token, user = MachineShop::User.authenticate(
          :email => params['userlogin']['email'], #publisher@csr.com
          :password => params['userlogin']['password'] #password        
      )
      
      # session[:user] = user
      # session[:auth_token] = auth_token

      puts "------------ in success"
      puts session[:auth_token]
      # puts auth_token
      # puts user
      redirect_to "/user/home", :status => :moved_permanently
    
      rescue MachineShop::AuthenticationError => ae
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
      rescue MachineShop::APIConnectionError => ape
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
      end
  	
  end

  def index
    # puts "-------- in index"
    # puts params
    # @login = params['login']
    # @login1 = 'asd'
  	render "index"
  end

  def home
    begin
      # puts "--------- auth token #{self.auth_token}"
      puts "--------- auth token #{session[:auth_token]}"
      # @devices = MachineShop::Device.all(@auth_token)
      puts "---------- list of devices"
      puts @devices
    rescue MachineShop::AuthenticationError => ae
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    end

  end

  def apiKeyCheck
    begin
      allRoles = MachineShop::User.all_roles(params['apiKey']['api_key'])
      # puts '------------------ roles'
      # puts allRoles
      redirect_to "/user/home/"
    rescue MachineShop::AuthenticationError => ae
      redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    rescue MachineShop::APIConnectionError => ape
      redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
    end
  end

end
