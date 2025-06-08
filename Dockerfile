FROM node:22.15.0 AS frontend-build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY ./frontend/package.json ./
COPY ./frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./frontend/ ./
RUN pnpm run build

FROM golang:alpine AS backend-build
WORKDIR /app
COPY backend/ ./
COPY --from=frontend-build /app/dist ./static/
RUN go build -o server .

FROM alpine
COPY --from=backend-build /app/server ./server
COPY --from=backend-build /app/static ./static
CMD ["./server"]
