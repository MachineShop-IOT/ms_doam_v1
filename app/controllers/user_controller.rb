require 'machineshop'
class UserController < ApplicationController
  # attr_accessible :auth_token
  def authenticate
    begin
    	auth_token, user = MachineShop::User.authenticate(
          :email => params['userlogin']['email'], #publisher@csr.com
          :password => params['userlogin']['password'] #password        
      )

      # @auth_token = auth_token
      # puts "------------ in success"
      # puts auth_token
      # puts user
      redirect_to "/user/home", :status => :moved_permanently
    
      rescue MachineShop::AuthenticationError => ae
        puts "------------ in error"
        puts "k hola haii? kina nachaleko"
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
