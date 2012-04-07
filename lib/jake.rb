require 'erb'
require 'fileutils'
require 'yaml'
require 'packr'
require 'eventful'

begin
  require 'erubis'
rescue LoadError
end

module Jake
  VERSION = '1.1.0'
  
  CONFIG_FILE = 'jake.yml'
  HELPER_FILE = 'Jakefile'
  EXTENSION   = '.js'
  
  dir = File.expand_path('../jake', __FILE__)
  autoload :Build,     dir + '/build'
  autoload :Buildable, dir + '/buildable'
  autoload :Bundle,    dir + '/bundle'
  autoload :Helper,    dir + '/helper'
  autoload :Package,   dir + '/package'
  
  def self.build!(path, options = {})
    build = Build.new(path, options)
    build.run!
  end
  
  def self.clear_hooks!
    Build.delete_observers
  end
  
  def self.path(*parts)
    parts = parts.compact.map { |p| p.to_s }
    File.expand_path(File.join(*parts))
  end
  
  def self.read(path)
    path = File.expand_path(path)
    [path, "#{path}#{EXTENSION}"].each do |file|
      return File.read(file) if File.file?(file)
    end
    return nil
  end
  
  def self.symbolize_hash(hash, deep = true)
    hash.inject({}) do |output, (key, value)|
      value = Jake.symbolize_hash(value) if deep and value.is_a?(Hash)
      output[(key.to_sym rescue key) || key] = value
      output
    end
  end
  
  def self.erb(template)
    defined?(Erubis) ? Erubis::Eruby.new(template) : ERB.new(template)
  end
end

def jake_helper(name, &block)
  Jake::Helper.class_eval do
    define_method(name, &block)
  end
end
alias :jake :jake_helper

def jake_hook(type, &block)
  Jake::Build.on(type, &block)
end

