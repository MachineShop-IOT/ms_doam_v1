class UserController < ApplicationController
  def authenticate
  	redirect_to "/user/home", :status => :moved_permanently
  end

  def index
  	# puts "in here"
  end

  def home
  end
end
