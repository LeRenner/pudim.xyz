REGISTRY ?= registry.pudim.xyz
TAG ?= main
PLATFORM ?= linux/amd64
IMAGE ?= $(REGISTRY)/lerenner/pudim-main-website:$(TAG)

export COMMIT_MESSAGE := $(value MESSAGE)

.PHONY: build push send
build:
	docker build --platform "$(PLATFORM)" --tag "$(IMAGE)" .

push: build
	docker push "$(IMAGE)"

send: push
	git add -A
	@if ! git diff --cached --quiet; then \
		if [ -n "$$COMMIT_MESSAGE" ]; then \
			git commit -s -m "$$COMMIT_MESSAGE"; \
		else \
			git commit -s; \
		fi; \
	fi
	git push
