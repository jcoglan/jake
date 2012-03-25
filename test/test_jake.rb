$VERBOSE = nil

require 'rubygems'
require 'bundler/setup'
require 'test/unit'
require File.expand_path('../../lib/jake', __FILE__)
require 'fileutils'
require 'find'

class TestJake < Test::Unit::TestCase
  DIR = File.expand_path('..', __FILE__)
  
  def setup
    FileUtils.rm_rf(File.join(DIR, 'output'))
  end
  
  def test_build
    Jake.clear_hooks!
    Jake.build!(DIR)
    
    expected = File.join(DIR, 'expected')
    actual   = File.join(DIR, 'output')
    
    Find.find(expected) do |path|
      next unless File.file?(path)
      actual_path = actual + path.gsub(expected, '')
      
      flunk "File #{actual_path} is missing" unless File.file?(actual_path)
      
      assert_equal File.read(path), File.read(actual_path),
                   "File #{actual_path} does not match #{path}"
    end
  end
end

