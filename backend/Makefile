# Detect the operating system
ifeq ($(OS),Windows_NT)
    # Windows commands
    DETECTED_OS := Windows
    DOCKER_BUILD := docker build . -t pii-backend
    DOCKER_RUN := docker run -p 5020:5020 pii-backend
else
    # Unix-like systems (Linux, macOS)
    DETECTED_OS := Unix
    DOCKER_BUILD := docker build . -t pii-backend
    DOCKER_RUN := docker run --network host pii-backend
HOST_UID := $(shell id -u)
HOST_GID := $(shell id -g)
endif

all dev:
	@echo "Detected OS: $(DETECTED_OS)"
	$(DOCKER_BUILD)
	$(DOCKER_RUN)

# Alternative targets for specific platforms
windows:
	@echo "Running on Windows"
	docker build . -t pii-backend
	docker run -p 5000:5000 pii-backend

unix:
	@echo "Running on Unix-like system"
	docker build . -t pii-backend
	docker run --network host pii-backend

# Clean up Docker images
clean:
	docker rmi pii-backend || true

test:
	docker build . -f Dockerfile.test -t pii-backend-test
	docker run pii-backend-test

.PHONY: all dev windows unix clean
