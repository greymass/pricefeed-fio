SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

define VERSION_TEMPLATE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "$(shell node -p 'require("./package.json").version')-$(shell git rev-parse --short HEAD)";
endef

export VERSION_TEMPLATE
lib: $(SRC_FILES) node_modules tsconfig.json
	tsc -p tsconfig.json --outDir lib && \
	echo "$$VERSION_TEMPLATE" > lib/version.js && \
	touch lib

.PHONY: dev
dev: node_modules
	@onchange -k -i 'src/**/*.ts' 'config/*' -- ts-node src/index.ts | bunyan -o short

.PHONY: lint
lint: node_modules
	@${BIN}/eslint src --ext .ts --fix

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: clean
clean:
	rm -rf lib/ coverage/ docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
