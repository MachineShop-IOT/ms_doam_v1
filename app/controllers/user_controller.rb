require 'machineshop'
require 'RMagick'

MachineShop.api_base_url = 'https://services.machineshop.io/api/v1'

class UserController < ApplicationController
  def authenticate
    begin
      auth_token, user = MachineShop::Users.authenticate(
                                                        :email => params['userlogin']['email'], #publisher@csr.com
                                                        :password => params['userlogin']['password'] #password
                                                        )

      session[:auth_token] = auth_token
      session[:user] = user.first_name << " " << user.last_name
      session[:last_sign_in_at] = user.last_sign_in_at
      redirect_to "/home", :status => :moved_permanently

    rescue MachineShop::AuthenticationError => ae
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    rescue MachineShop::APIConnectionError => ape
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end
  end

  def logout
    session[:auth_token] = nil
    session[:user] = nil
    session[:last_sign_in_at] = nil
    redirect_to "/index"
  end

  def index
    puts " param value in index --------------------------- #{params[:login]}"
    render "index"
  end

  def home
    begin
      @dis_list = Array.new
      dis = MachineShop::DataSources.all({}, session[:auth_token])
      puts "dis_______#{dis}"
      dis.to_a.each do |di|
        @dis_list << [di['name'], di['_id']]
      end
    rescue MachineShop::AuthenticationError => ae
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end

    # @location = get_location_data

  end

  def apiKeyCheck
    begin
      allRoles = MachineShop::Users.all_roles(params['apiKey']['api_key'])
      session[:auth_token] = params['apiKey']['api_key']
      redirect_to "/home"
    rescue MachineShop::AuthenticationError => ae
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    rescue MachineShop::APIConnectionError => ape
      redirect_to "/index", :status => :moved_permanently, :login => 'asdad'
    end
  end
end
