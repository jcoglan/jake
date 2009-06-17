require 'erb'
require 'fileutils'
require 'observer'
require 'yaml'
require 'rubygems'
require 'packr'

begin
  require 'erubis'
rescue LoadError
end

module Jake
  VERSION = '0.9.4'
  
  CONFIG_FILE = 'jake.yml'
  HELPER_FILE = 'Jakefile'
  EXTENSION   = '.js'
  
  # Runs a build in the given directory. The directory must contain a jake.yml
  # file, and may contain a Jakefile. See README for example YAML configurations.
  def self.build!(path, options = {})
    build = Build.new(path, options)
    build.run!
  end
  
  # Removes all registered build event hooks.
  def self.clear_hooks!
    Build.delete_observers
  end
  
  # Returns the contents of the given path, which may be missing a .js extension.
  def self.read(path)
    path = File.expand_path(path)
    [path, "#{path}#{EXTENSION}"].each do |p|
      return File.read(p).strip if File.file?(p)
    end
    return nil
  end
  
  # Returns a copy of the given hash with the keys cast to symbols.
  def self.symbolize_hash(hash, deep = true)
    hash.inject({}) do |output, (key, value)|
      value = Jake.symbolize_hash(value) if deep and value.is_a?(Hash)
      output[(key.to_sym rescue key) || key] = value
      output
    end
  end
  
  # Returns either an Erubis or ERB instance, depending on what's available.
  def self.erb(template)
    defined?(Erubis) ? Erubis::Eruby.new(template) : ERB.new(template)
  end
  
end

%w(helper observer build buildable package bundle).each do |file|
  require File.dirname(__FILE__) + '/jake/' + file
end

# Adds a helper method that can be called from ERB.
def jake_helper(name, &block)
  Jake::Helper.class_eval do
    define_method(name, &block)
  end
end
alias :jake :jake_helper

# Registers an event listener that will fire whenever a build is run.
def jake_hook(type, &block)
  Jake::Observer.new(type, &block)
end

