REGISTRY ?= registry.pudim.xyz
TAG ?= main
PLATFORM ?= linux/amd64
KUBECTL ?= kubectl
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
	@$(KUBECTL) -n pudimnetes get deployment pudim-website-deployment \
		-o 'jsonpath={range .spec.template.spec.containers[*]}{.image}{" "}{.imagePullPolicy}{"\n"}{end}' | \
		grep -Fxq -- "$(IMAGE) Always" || { \
			echo "Expected pudim-website-deployment to use $(IMAGE) with imagePullPolicy Always." >&2; exit 1; \
		}
	$(KUBECTL) -n pudimnetes delete pods --selector=app=pudim-website
