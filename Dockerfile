FROM golang:1.27.4-bookworm@sha256:ce59b41415e2524ae99926fe1f37ce48ba8c194dcbd2a56a65436cdcefa2bd34 AS caddy
WORKDIR /build
# Backport Caddy's security dependency updates to the stable release.
RUN --mount=type=cache,target=/go/pkg/mod,sharing=locked \
    --mount=type=cache,target=/root/.cache/go-build,sharing=locked \
    go mod init local/caddy-build \
    && go get github.com/caddyserver/caddy/v2/cmd/caddy@v2.11.9 \
        github.com/smallstep/certificates@v0.30.3-0.20261105213751-6d5a251fbe01 \
        go.step.sm/crypto@v0.92.0 \
        github.com/go-jose/go-jose/v4@v4.1.9 \
        golang.org/x/net@v0.62.0 \
        golang.org/x/crypto@v0.59.0 \
        go.opentelemetry.io/otel/sdk@v1.47.0 \
        go.opentelemetry.io/otel/sdk/log@v1.47.0 \
        go.opentelemetry.io/otel/sdk/metric@v1.47.0 \
    && CGO_ENABLED=0 go build \
        -ldflags '-X github.com/caddyserver/caddy/v2.CustomVersion=v2.11.9' \
        -o /out/caddy github.com/caddyserver/caddy/v2/cmd/caddy

FROM alpine:3.24.4 AS website
RUN apk add --no-cache exiftool
WORKDIR /website
COPY src/ .
RUN find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.heic" \) \
    -exec exiftool -overwrite_original -all= {} +

FROM scratch
ENV XDG_CONFIG_HOME=/config XDG_DATA_HOME=/data
COPY --from=caddy /out/caddy /usr/bin/caddy
COPY --from=caddy /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=website /website/ /var/www/html/
EXPOSE 80
ENTRYPOINT ["/usr/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
