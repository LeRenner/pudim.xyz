REGISTRY ?= registry.internal.pudim.xyz
TAG ?= main
PLATFORM ?= linux/amd64
KUBECTL ?= kubectl
KUBE_CONTEXT ?= default
KUBE_TIMEOUT ?= 180s
KUBE_NAMESPACE := pudim-website
KUBE_DEPLOYMENT := pudim-website-deployment
KUBE_CONTAINER := pudim-website-container
KUBE_SELECTOR := app=pudim-website
KUBE = $(KUBECTL) --context "$(KUBE_CONTEXT)" --namespace "$(KUBE_NAMESPACE)"
IMAGE ?= $(REGISTRY)/lerenner/pudim-main-website:$(TAG)

export COMMIT_MESSAGE := $(value MESSAGE)

.PHONY: build push send check-send
build:
	docker build --platform "$(PLATFORM)" --tag "$(IMAGE)" .

push: build
	docker push "$(IMAGE)"

check-send:
	@set -e; \
	live=$$($(KUBE) get deployment "$(KUBE_DEPLOYMENT)" \
		-o 'jsonpath={range .spec.template.spec.containers[?(@.name=="$(KUBE_CONTAINER)")]}{.image}{" "}{.imagePullPolicy}{end}{" app="}{.spec.selector.matchLabels.app}'); \
	expected="$(IMAGE) Always $(KUBE_SELECTOR)"; \
	if [ "$$live" != "$$expected" ]; then \
		printf 'Deployment %s/%s must match NeuPudimnetes before release.\nExpected: %s\nFound: %s\n' \
			"$(KUBE_NAMESPACE)" "$(KUBE_DEPLOYMENT)" "$$expected" "$$live" >&2; \
		exit 1; \
	fi

send: check-send
	$(MAKE) push
	git add -A
	@if ! git diff --cached --quiet; then \
		if [ -n "$$COMMIT_MESSAGE" ]; then \
			git commit -s -m "$$COMMIT_MESSAGE"; \
		else \
			git commit -s; \
		fi; \
	fi
	git push
	$(MAKE) check-send
	$(KUBE) delete pods --selector="$(KUBE_SELECTOR)" --timeout="$(KUBE_TIMEOUT)"
	$(KUBE) rollout status deployment/"$(KUBE_DEPLOYMENT)" --timeout="$(KUBE_TIMEOUT)"
