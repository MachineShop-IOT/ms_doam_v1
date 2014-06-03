require 'machineshop'
class UserController < ApplicationController
  def authenticate
    begin
    	auth_token, user = MachineShop::User.authenticate(
          :email => params['userlogin']['email'], #publisher@csr.com
          :password => params['userlogin']['password'] #password        
      )
      puts "------------ in success"
      redirect_to "/user/home", :status => :moved_permanently
    
      rescue MachineShop::AuthenticationError => ae
        puts "------------ in error"
        puts "k hola haii? kina nachaleko"
        redirect_to "/user/index", :status => :moved_permanently, :login => 'asdad'
        # puts auth_token
        # puts user
      end
  	
  end

  def index
    # puts "-------- in index"
    # puts params
    # @login = params['login']
    # @login1 = 'asd'
  	render "index"
  end

  def login
  	
  end

  def home
  end

  def apiKeyCheck
    render json: 'true'
  end
end
