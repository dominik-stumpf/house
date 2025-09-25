FROM node:22.15.0 AS frontend-builder
WORKDIR /frontend
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY frontend/package.json ./
COPY frontend/pnpm-lock.yaml ./
COPY frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend ./
RUN pnpm run build

FROM golang:1.24.3-alpine AS binary-builder
ARG APP_NAME=backend
RUN apk update && apk upgrade && apk --update add git upx
WORKDIR /backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
COPY --from=frontend-builder /backend/spa ./spa
# RUN cat spa/index.html || exit 1
# RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build \
#     -ldflags='-w -s -extldflags "-static"' -a \
#     -o engine && upx -9 engine
RUN go build -o engine

FROM alpine
ENV APP_PORT=8080
WORKDIR /app
COPY --from=binary-builder --chown=nonroot:nonroot /backend/engine .
ENTRYPOINT ["./engine"]
