# makefile for physics_project
#
#
# You need to create a symbolic link for esbuild in the myphysicslab directory, with
# a command like this (using the path to esbuild on your system)
#    ln -s node_modules/esbuild/bin/esbuild esbuild
# You can test whether this works by doing:
#    cd myphysicslab
#    ./esbuild --version
#
# If you want to build the documentation, you also need to make a symbolic link
# for typedoc, like this  (using the path to typedoc on your system)
#    ln -s node_modules/typedoc/bin/typedoc typedoc
# You can test whether this works by doing:
#    cd myphysicslab
#    ./typedoc --version
#
# Debugging hints:
# make -d  Print  debugging  information in addition to normal processing.
# make -n  Print the commands that would be executed, but do not execute them.
# make -r  Eliminate use of the built-in implicit rules.
# make -s  Silent mode, don't print commands as they are executed
# make -t  touch mode, Marks targets as up to date without actually changing them.
# make help  Prints descriptions of available targets
# Try adding a line to a recipe like this to see value of automatic variables
#    echo $^
#
# Using make -n and make -t are useful for debugging the makefile dependencies.

# set the default target here.  Prerequisites are given later on.
all:
#
# Detect which operating system we are running under
# From: https://stackoverflow.com/questions/714100/os-detecting-makefile
ifeq ($(OS),Windows_NT)
    detected_OS := Windows
else
    detected_OS := $(shell uname -s)
endif

# Different copy command for different operating systems
# For MacOS (Darwin) we want -X to not copy extended attributes
COPY_CMD := cp -va
ifeq ($(detected_OS),Darwin)
    COPY_CMD := cp -vaX
endif

# BUILD_DIR is name of build directory, relative to makefile location
BUILD_DIR := build

# if LOCALE is not specified, then build all locale versions
ifndef LOCALE
    LOCALE := en de
endif

biketimer: 
pendulum: $(foreach loc,$(LOCALE),\
  $(BUILD_DIR)/sims/pendulum/PendulumApp-$(loc).html )

# special rules for HTML file which requires different-named JS file

app_names := sims/pendulum/PendulumApp

bld_apps := $(addprefix $(BUILD_DIR)/,$(app_names))

# Copy stylesheet.css to build/
css_files := $(wildcard src/stylesheet*.css)
bld_css := $(subst src/,$(BUILD_DIR)/,$(css_files))
$(bld_css): $(BUILD_DIR)/%.css : src/%.css
	@mkdir -v -p $(dir $@)
	@$(COPY_CMD) $< $@

# Copy images to build/images
img_files := $(wildcard src/images/*.png src/images/*.gif src/images/*.jpg \
src/images/*.mp3)

build_images := $(subst src/,$(BUILD_DIR)/,$(img_files))
$(build_images): $(BUILD_DIR)/images/% : src/images/%
	@mkdir -v -p $(dir $@)
	@$(COPY_CMD) $< $@

src_ts := $(shell find src -name '*.ts')
lab_ts := $(shell find src/lab -name '*.ts')

macros_req := src/macros.html \
src/macros_tab.html \
src/macros_vert.html

# Extra requirement for some HTML test files
$(BUILD_DIR)/test/UnitTest*.html \
$(BUILD_DIR)/test/Engine2DTests*.html \
$(BUILD_DIR)/test/PerformanceTests*.html \
$(BUILD_DIR)/test/SingleTest*.html : src/test/macros_test.html

# tsc seems to not work from within makefile
#$(BUILD_DIR)%.js : src/%.ts
#	./node_modules/.bin/tsc

# about bash quotes:  in bash, single-quote suppresses any interpretation of what
# is inside the single quotes.  For example:
#     echo '"$(date)"'
#     "$(date)"
# But inside the makefile, the command $(shell date) is executed BEFORE the 
# command is passed to bash.  Even though that command is inside single quotes.
# The makefile command
#     echo '"$(shell date)"'
# looks like this to bash
#     echo '"Mon Apr 3 07:51:06 PDT 2023"'
#     "Mon Apr 3 07:51:06 PDT 2023"

apps_js_en := $(addsuffix -en.js,$(bld_apps))
$(apps_js_en): $(BUILD_DIR)/%-en.js : $(BUILD_DIR)/%.js
	./esbuild $< --outfile=$@ --bundle --format=iife \
	--platform=browser  \
	--define:MPL_LOCALE='"en"' \
	--define:MPL_BUILD_TIME='"$(shell date)"' --minify

# rules for HTML file which requires same-named JS file (most apps are like this)

$(BUILD_DIR)/%-en.html : src/%.html src/index_order.txt $(macros_req) | settings \
  $(BUILD_DIR)/%-en.js $(build_images) $(bld_css)
	perl prep_html.pl $< $@ src/index_order.txt

index_files := $(BUILD_DIR)/index-en.html
$(index_files): $(BUILD_DIR)/index-%.html : src/index.html src/macros.html
	@mkdir -v -p $(dir $@)
	perl prep_html.pl $< $@ ""


apps-en: $(BUILD_DIR)/index-en.html $(addsuffix -en.html,$(bld_apps))

apps: apps-en apps-de

combos: $(BUILD_DIR)/sims/misc/CollisionCombo-en.js \
$(BUILD_DIR)/sims/misc/CollisionCombo-de.js

all: settings apps combos

# When a line starts with ‘@’, the echoing of that line is suppressed. The ‘@’ is
# discarded before the line is passed to the shell.
help:
	@echo "Available targets:"
	@echo "all         Make all applications, tests, index files"
	@echo "apps        Make all applications, tests"
	@echo "apps-de     Make German versions of apps"
	@echo "apps-en     Make English versions of apps"
	@echo "clean       Deletes build directory"
	@echo "compiler    Shows options for closure compiler"
	@echo "deps        Calculate dependencies needed for running uncompiled"
	@echo "docs        Make documentation"
	@echo "docs-md     Make markdown documentation (overview, engine2D, ...)"
	@echo "help        List available targets"
	@echo "index       Make index files (table of contents for tests)"
	@echo "perf        Make performance test"
	@echo "settings    Lists current value of important settings used by this makefile"
	@echo "test        Make engine2D test"
	@echo "unittest    Make unit tests"
	@echo ""
	@echo "Options:"
	@echo "BUILD_DIR=     where to put compiled files; default is build"
	@echo "LOCALE=        en, de; default is en"

settings:
	@echo "Current settings:"
	@echo "BUILD_DIR = $(BUILD_DIR)"
	@echo "LOCALE = $(LOCALE)"

# PHONY means "don't bother trying to make an actual file with this name"
# PHONY also means "always out of date if it has no prerequistes"
# PHONY also prevents implicit rules from trying to build these.
.PHONY: all apps apps-de apps-en clean deps docs help index settings unit-test \
  compiler docs-md engine2d experimental pendulums roller springs alltest

# If .DELETE_ON_ERROR is mentioned as a target anywhere in the makefile, then make will
# delete the target of a rule if it has changed and its recipe exits with a nonzero exit
# status.
.DELETE_ON_ERROR:
