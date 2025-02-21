# dynamic config
ARG             BUILD_DATE
ARG             VCS_REF
ARG             VERSION

# build
FROM            golang:1.18-alpine as builder
RUN             apk add --no-cache git gcc musl-dev make
ENV             GO111MODULE=on
RUN		apk update
RUN		apk install git
RUN		git clone https://github.com/drinaaf/berty
WORKDIR         /go/src/berty.tech/berty
COPY            go.* ./
RUN             go mod download
COPY            ./go ./go
COPY            ./.git ./.git
WORKDIR         /go/src/berty.tech/berty/go
RUN             make go.install
CMD 		["berty", "daemon"]

